import Rwebsocket from 'reconnecting-websocket';
/**
 * 实例化WS
 */
function initQDWS(wsUrl: string) {
  const ws = new Rwebsocket(wsUrl, undefined, { debug: false, reconnectionDelayGrowFactor: 3000 });
  console.info(`ws地址:${wsUrl}`);
  return ws;
}
/**
 * 打开监听
 * @param ws
 * @param fun
 * @returns {null}
 */
function listnerOpen(ws: Rwebsocket, fun: Function) {
  if (ws == undefined) {
    return null;
  } else if (typeof fun === 'function') {
    // 打开回调方法
    ws.onopen = function(event: any) {
      fun(event.data);
    };
  }
}

/**
 * 错误监听
 * @param ws
 * @param fun
 * @returns {null}
 */
function listnerError(ws: Rwebsocket, fun: Function) {
  if (ws == undefined) {
    return null;
  } else if (typeof fun === 'function') {
    // 错误回调方法
    ws.onerror = function(event: any) {
      fun(event.data);
    };
  }
}
/**
 * 监听消息
 * @param ws
 * @param fun
 * @returns {null}
 */
function listnerMessage(ws: Rwebsocket, fun: Function) {
  if (ws == undefined) {
    return null;
  } else if (typeof fun === 'function') {
    // 接收到消息的回调方法
    ws.onmessage = function(event: any) {
      fun(event.data);
    };
  }
}

/**
 * 关闭监听
 * @param ws
 * @param fun
 * @returns {null}
 */
function listnerClose(ws: Rwebsocket, fun: Function) {
  if (ws == undefined) {
    return null;
  } else {
    // 关闭回调方法
    if (typeof fun === 'function') {
      ws.onclose = function() {
        fun();
      };
    }
    return null;
  }
}

/**
 * 注册监听
 * @param ws
 * @param callBacks
 * @returns {null}
 */
function registerListner(ws: Rwebsocket, callBacks: any) {
  if (ws == null) {
    return null;
  } else {
    const open = callBacks.open || null;
    const error = callBacks.error || null;
    const message = callBacks.message || null;
    const close = callBacks.close || null;
    listnerOpen(ws, open);
    listnerError(ws, error);
    listnerMessage(ws, message);
    listnerClose(ws, close);
  }
}

export default {
  initQDWS,
  registerListner,
};
