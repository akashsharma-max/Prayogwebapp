type Listener = (isLoading: boolean) => void;

class LoadingSpinner {
    private activeRequests = 0;
    private listeners: Set<Listener> = new Set();

    subscribe(listener: Listener): void {
        this.listeners.add(listener);
    }

    unsubscribe(listener: Listener): void {
        this.listeners.delete(listener);
    }

    private notify(): void {
        const isLoading = this.activeRequests > 0;
        this.listeners.forEach(listener => listener(isLoading));
    }

    show(): void {
        this.activeRequests++;
        if (this.activeRequests === 1) {
            this.notify();
        }
    }

    hide(): void {
        if (this.activeRequests > 0) {
            this.activeRequests--;
            if (this.activeRequests === 0) {
                this.notify();
            }
        }
    }
}

const loadingSpinner = new LoadingSpinner();
export default loadingSpinner;
