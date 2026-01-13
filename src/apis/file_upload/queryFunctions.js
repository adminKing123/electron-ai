import api from "..";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

export const uploadFileAPI = ({
  fileObj,
  chatId,
  onProgress,
  onComplete,
  onError,
  onAbort,
  onStart,
}) => {
  const xhr = new XMLHttpRequest();

  const uploadTask = new Promise(async (resolve, reject) => {
    try {
      const user = useUserStore.getState().user;
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken(true);
      const formData = new FormData();

      formData.append("file", fileObj.file);
      formData.append("chat_id", chatId);
      formData.append("file_id", fileObj.id);
      formData.append("file_type", fileObj.file.type);

      onStart?.(fileObj, xhr.abort.bind(xhr));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress?.(fileObj, progress);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          onComplete?.(fileObj, data);
          resolve(data);
        } else {
          const err = new Error(xhr.responseText || "Upload failed");
          onError?.(fileObj, err);
          reject(err);
        }
      };
      xhr.onerror = () => {
        const err = new Error("Network error during upload");
        onError?.(fileObj, err);
        reject(err);
      };
      xhr.onabort = () => {
        onAbort?.(fileObj);
        reject(new Error("Upload aborted"));
      };
      xhr.open("POST", ENDPOINTS.GET_UPLOAD_FILE(), true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      onError?.(fileObj, err);
      reject(err);
    }
  });

  return {
    uploadTask,
    abort: () => xhr.abort(),
  };
};

export const removeFileAPI = async (file_id) => {
  const response = await api({
    method: "DELETE",
    url: ENDPOINTS.GET_DELETE_FILE(file_id),
  });
  return response.data;
};
