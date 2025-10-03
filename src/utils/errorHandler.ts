type ErrorCallback = (message: string) => void;

class ErrorHandler {
  private callback: ErrorCallback | null = null;

  setCallback(callback: ErrorCallback) {
    this.callback = callback;
  }

  showError(message: string) {
    if (this.callback) {
      this.callback(message);
    }
  }
}

export const errorHandler = new ErrorHandler();
