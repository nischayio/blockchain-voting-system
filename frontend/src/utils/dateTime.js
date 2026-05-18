// date time match to IST
export const formatForDateTimeInput = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const indiaDate = new Date(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  );

  const year = indiaDate.getFullYear();
  const month = String(indiaDate.getMonth() + 1).padStart(2, "0");
  const day = String(indiaDate.getDate()).padStart(2, "0");
  const hours = String(indiaDate.getHours()).padStart(2, "0");
  const minutes = String(indiaDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatToIST = (dateString) => {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
};
