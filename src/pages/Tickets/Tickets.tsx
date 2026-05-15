import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../../api';
import { TicketsCard } from '../../components/common/TicketsCard/TicketsCard';
import { ROUTES } from '../../constants/routes';
import {
  TICKET_ALERT_MESSAGES,
  TICKET_STATUS,
  TicketStatusType,
} from '../../constants/tickets';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import './Tickets.scss';

export const Tickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext(); // 取得用戶資料和完整的 API response
  const [activeStatus, setActiveStatus] = useState<TicketStatusType>(
    TICKET_STATUS.COLLECTED
  );
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [collectedTickets, setCollectedTickets] = useState<any[]>([]);
  const [ticketTypesMap, setTicketTypesMap] = useState<Map<string, any>>(
    new Map()
  );
  const { showLoading, hideLoading } = useLoading();

  // 根據狀態過濾票券的函數
  const getFilteredTickets = (orders: any[], status: TicketStatusType) => {
    // 如果是已取票狀態，直接返回從 API 獲取的已取票資料
    if (status === TICKET_STATUS.COLLECTED) {
      return collectedTickets;
    }

    // 從所有訂單中提取所有票券
    const allTickets = orders.flatMap(order =>
      order.tickets.map((ticket: any) => ({ ...ticket, order }))
    );
    return allTickets.filter(ticket => {
      switch (status) {
        case TICKET_STATUS.PURCHASED:
          // 待取票：抓完整 group（含已分票），group-level 再過濾有未分票的 group
          return ticket.order?.status === TICKET_STATUS.COMPLETED;

        case TICKET_STATUS.REFUNDED:
          // 退款記錄：票券所屬訂單退款
          return ticket.order?.status === TICKET_STATUS.REFUNDED;

        default:
          return false;
      }
    });
  };

  // 根據 order.id 和 ticket.type.id 分組票券的函數
  const groupTicketsByOrderAndType = (tickets: any[]): any[][] => {
    const grouped = tickets.reduce((groups: any, ticket: any) => {
      const orderId = ticket.order?.id || 'unknown';
      const typeId = ticket.type?.id || 'unknown';
      const groupKey = `${orderId}-${typeId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(ticket);
      return groups;
    }, {});

    return Object.values(grouped) as any[][];
  };

  // 初始化時調用 getTickets API
  useEffect(() => {
    const fetchTickets = async () => {
      if (user?.id) {
        try {
          showLoading('載入票券中...');

          // 並行獲取訂單資料、已取票資料和票券類型資料
          const [ordersResponse, ticketsResponse, ticketTypesResponse] =
            await Promise.all([
              apiService.orders.getOrders(user.id),
              apiService.tickets.getTickets(user.id),
              apiService.ticketsTypes.getTicketsTypes(),
            ]);

          const orders = ordersResponse.docs || [];
          const tickets = ticketsResponse.docs || [];

          const ticketTypes = ticketTypesResponse.docs || [];

          // 建立票券類型 Map，key 是票券類型 ID，value 是票券類型資料
          const typesMap = new Map();
          ticketTypes.forEach((type: any) => {
            typesMap.set(type.id, type);
          });

          setAllOrders(orders);
          setCollectedTickets(tickets);
          setTicketTypesMap(typesMap);

          // 設定預設 Tab：若已購買有票券則跳到已購買，否則跳到已取票
          const allTickets = orders.flatMap((order: any) =>
            order.tickets.map((ticket: any) => ({ ...ticket, order }))
          );
          const purchasedTickets = allTickets.filter(
            (ticket: any) =>
              ticket.order?.status === TICKET_STATUS.COMPLETED &&
              !ticket.isRedeemed
          );

          const defaultTab = location.state?.defaultTab as
            | TicketStatusType
            | undefined;
          if (defaultTab) {
            setActiveStatus(defaultTab);
          } else if (purchasedTickets.length > 0) {
            setActiveStatus(TICKET_STATUS.PURCHASED);
          } else {
            setActiveStatus(TICKET_STATUS.COLLECTED);
          }

          setTimeout(() => {
            hideLoading();
          });
        } catch (error) {
          hideLoading();
          console.error('Failed to fetch orders:', error);
          setAllOrders([]);
          setCollectedTickets([]);
        }
      }
    };

    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 票券狀態數據
  const ticketStatuses = [
    {
      key: TICKET_STATUS.PURCHASED,
      title: '待取票',
      count: getFilteredTickets(allOrders, TICKET_STATUS.PURCHASED).filter(
        (ticket: any) => !ticket.isRedeemed
      ).length,
    },
    {
      key: TICKET_STATUS.COLLECTED,
      title: '已取票',
      count: getFilteredTickets(allOrders, TICKET_STATUS.COLLECTED).length,
    },
    {
      key: TICKET_STATUS.REFUNDED,
      title: '退票紀錄',
      count: getFilteredTickets(allOrders, TICKET_STATUS.REFUNDED).length,
    },
  ];

  // 點擊處理函數
  const handleStatusClick = (statusKey: TicketStatusType) => {
    setActiveStatus(statusKey);
  };

  const noTicketText = () => {
    switch (activeStatus) {
      case TICKET_STATUS.PURCHASED:
        return '目前沒有待取票票券';
      case TICKET_STATUS.COLLECTED:
        return '您尚未持有任何票券';
      case TICKET_STATUS.REFUNDED:
        return '目前尚無退票紀錄';
      default:
        return '您尚未持有任何票券';
    }
  };

  const getAlertContent = () => {
    const messages =
      TICKET_ALERT_MESSAGES[activeStatus] ||
      TICKET_ALERT_MESSAGES[TICKET_STATUS.COLLECTED];
    return (
      <>
        {messages.lines.map((line, index) => (
          <span key={index}>
            {line}
            {index < messages.lines.length - 1 && <br />}
          </span>
        ))}
      </>
    );
  };

  // 組件邏輯
  return (
    <>
      <div className="tickets-container">
        <div className="tickets-header">
          <h1>我的票券</h1>
          <div className="ticket-header-status">
            {ticketStatuses.map(status => (
              <div
                key={status.key}
                className={`ticket-header-status-item ${activeStatus === status.key ? 'active' : ''}`}
                onClick={() => handleStatusClick(status.key)}
              >
                <p className="status-title">{status.title}</p>
                <div className="status-count-wrapper">
                  <p className="status-count">{status.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="tickets-alert-container">
          <div className="ticket-alert-title">
            <img src="/images/ticket-alert-dot.svg" alt="" />
            <p>貼心提醒</p>
          </div>
          <div className="ticket-alert-content">{getAlertContent()}</div>
        </div>
        <div className="tickets-content-container">
          {(() => {
            const filteredTickets = getFilteredTickets(allOrders, activeStatus);
            const groupedTickets =
              activeStatus === TICKET_STATUS.PURCHASED
                ? groupTicketsByOrderAndType(filteredTickets).filter(group =>
                    group.some(
                      (ticket: any) =>
                        !(ticket.isRedeemed && ticket.user?.consentedAt)
                    )
                  )
                : groupTicketsByOrderAndType(filteredTickets);

            return filteredTickets.length === 0 ? (
              <>
                <p className="no-ticket-text">{noTicketText()}</p>
              </>
            ) : (
              <>
                {groupedTickets.map(
                  (ticketGroup: any[], groupIndex: number) => {
                    // 取得該票券組的基本資訊（從第一張票券取得）
                    const firstTicket = ticketGroup[0];
                    const order = firstTicket.order;
                    const ticketType = firstTicket.type;

                    // 取得 ticketGroup 裡的 id
                    const ticketIds = ticketGroup.map(ticket => ticket.id);

                    // 計算該票種的數量
                    const quantity = ticketGroup.length;

                    // 取得票券的詳細描述
                    const ticketDetails =
                      ticketType?.description?.map(
                        (desc: any) => desc.bulletpoint
                      ) || [];

                    // 從 ticketTypesMap 取得票券圖片（orders API 的 image 只有 ID）
                    const ticketTypeData = ticketTypesMap.get(ticketType?.id);
                    const ticketImageUrl =
                      ticketTypeData?.image?.url || '/images/ticket-sample.png';
                    const bundleSize = ticketType?.bundleSize || 1;

                    const hasDistributedTicket = order?.tickets?.some(
                      (ticket: any) => ticket.isRedeemed
                    );

                    // 分類票券狀態
                    const ticketsByStatus = {
                      undistributed: ticketGroup.filter(
                        (ticket: any) =>
                          ticket.order?.status === TICKET_STATUS.COMPLETED &&
                          !ticket.isRedeemed
                      ),
                      distributedNotCollected: ticketGroup.filter(
                        (ticket: any) =>
                          !ticket.user?.consentedAt && ticket.isRedeemed
                      ),
                      distributedAndCollected: ticketGroup.filter(
                        (ticket: any) =>
                          ticket.user?.consentedAt && ticket.isRedeemed
                      ),
                    };

                    return (
                      <TicketsCard
                        key={`${order?.id}-${ticketType?.id}-${groupIndex}`}
                        ticketTypeId={ticketType?.id || 'N/A'}
                        ticketCaption={ticketType?.caption || ''}
                        ticketImageUrl={ticketImageUrl}
                        ticketMeta={ticketType.meta || ''}
                        title={ticketType?.name || ''}
                        quantity={quantity}
                        orderNumber={order?.id || 'N/A'}
                        details={ticketDetails}
                        status={activeStatus}
                        ticketIds={ticketIds}
                        updatedAt={order?.updatedAt}
                        user={ticketsByStatus}
                        hasDistributedTicket={hasDistributedTicket}
                        bundleSize={bundleSize}
                        ticketUserName={
                          firstTicket.user?.name ||
                          firstTicket.owner?.name ||
                          ''
                        }
                        ticketUserEmail={
                          firstTicket.user?.email ||
                          firstTicket.owner?.email ||
                          ''
                        }
                        ticketId={firstTicket.id || ''}
                      />
                    );
                  }
                )}
              </>
            );
          })()}
        </div>
        {(() => {
          const filteredTickets = getFilteredTickets(allOrders, activeStatus);

          return (
            filteredTickets.length === 0 &&
            (activeStatus === TICKET_STATUS.PURCHASED ||
              activeStatus === TICKET_STATUS.COLLECTED)
          );
        })() && (
          <div className="tickets-btn-container">
            {(activeStatus === TICKET_STATUS.PURCHASED ||
              activeStatus === TICKET_STATUS.COLLECTED) && (
              <button
                className="btn send-btn m-b-16"
                onClick={() => navigate(ROUTES.BOOKING)}
              >
                前往購票
              </button>
            )}
          </div>
        )}
        <button
          className="btn cancel-btn"
          onClick={() => navigate(ROUTES.HOME)}
        >
          返回票券系統
        </button>
      </div>
    </>
  );
};
