const handlePart = (part) => {
  if (part?.type === "text") return part.data;
  return "";
};

export const getCopiableAnswer = (answer) => {
  const contentParts = answer
    ?.map((part) => handlePart(part))
    ?.filter((part) => part?.length);
  return contentParts.join("\n");
};
