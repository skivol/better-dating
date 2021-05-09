export const TabPanel = (props: any) => {
  const { children, value, index } = props;
  if (value !== index) {
    return null;
  }

  // consider example from https://material-ui.com/ru/components/tabs/#simple-tabs ?
  return children;
};
