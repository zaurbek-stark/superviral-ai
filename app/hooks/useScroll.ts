import { RefObject, useEffect } from "react";

export const useScroll = ({ref, trigger}: {ref: RefObject<HTMLDivElement>, trigger: any}) => {
  const scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } = ref.current as HTMLDivElement
    if (scrollHeight >= scrollTop + offsetHeight) {
      ref.current?.scrollTo(0, scrollHeight + 200)
    }
  }

  useEffect(() => {
    scroll();
  }, [trigger]);
}