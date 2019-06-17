import { EnthusiasmAction } from '../actions';
import { StoreState } from '../types/index';
import { INCREMENT_ENTHUSIASM, DECREMENT_ENTHUSIASM } from '../constants/index';

// FIXME Figure out if "StoreState | undefined" usage is unavoidable using latest Redux
export function enthusiasm(state: StoreState | undefined, action: EnthusiasmAction): StoreState | undefined {
  if (state === undefined) {
    return state;
  }
  switch (action.type) {
    case INCREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: state.enthusiasmLevel + 1 };
    case DECREMENT_ENTHUSIASM:
      return { ...state, enthusiasmLevel: Math.max(1, state.enthusiasmLevel - 1) };
  }
  return state;
}
