export const TRADE_OPEN = false;

export const TOKEN_LOCK = {
  tradeOpen: TRADE_OPEN,
  minedLocked: !TRADE_OPEN,
  presaleLocked: !TRADE_OPEN,
  tokensLocked: !TRADE_OPEN,
  message: "WLT is locked. Withdraw and send stay closed until trade opens.",
};
