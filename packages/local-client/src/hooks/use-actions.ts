import { useMemo } from "react";
import { bindActionCreators } from "redux";
import { actionCreators } from "../state";
import { useDispatch } from "react-redux";

export const useActions = () => {
  const dispatch = useDispatch();



  return useMemo(() => {
    return bindActionCreators(actionCreators, dispatch);
  }, [dispatch])
}
