if (typeof (globalThis as any).expo === 'undefined') {
  (globalThis as any).expo = {
    EventEmitter: class EventEmitter {
      addListener() {
        return { remove: () => {} };
      }
      removeListener() {}
      emit() {}
    },
    NativeModule: class NativeModule {},
    SharedObject: class SharedObject {},
    SharedRef: class SharedRef {},
    modules: {},
  };
}

export {};
