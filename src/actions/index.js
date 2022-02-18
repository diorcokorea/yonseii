//gloval variable collection
export const globalVariable = (obj) => {
  return {
    type: Object.keys(obj)[0],
    payload: obj[Object.keys(obj)[0]],
  };
};
