// Chrome Extension API type declarations
declare namespace chrome {
  namespace runtime {
    const onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void;
    };

    const onStartup: {
      addListener(callback: () => void): void;
    };

    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
    };

    function sendMessage(
      message: any,
      callback?: (response: any) => void
    ): void;

    const lastError: any;
  }

  namespace storage {
    namespace local {
      function get(
        keys: string[] | string | null,
        callback: (result: any) => void
      ): void;

      function set(items: any, callback?: () => void): void;

      function remove(keys: string[] | string, callback?: () => void): void;

      function clear(callback?: () => void): void;
    }
  }

  namespace tabs {
    const onUpdated: {
      addListener(
        callback: (
          tabId: number,
          changeInfo: { status?: string },
          tab: { url?: string }
        ) => void
      ): void;
    };
  }

  namespace action {
    const onClicked: {
      addListener(callback: (tab: any) => void): void;
    };
  }

  namespace scripting {
    function executeScript(options: {
      target: { tabId: number };
      files: string[];
    }): Promise<void>;
  }
}
