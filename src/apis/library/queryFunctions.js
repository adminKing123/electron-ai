import {
  getDocs,
  collection,
  orderBy,
  query,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import useUserStore from "../../store/useUserStore";
import { db } from "../../firebase";
import CONFIG from "../../config";

export const getFilesAPI = async (parent_id, pageParam = null) => {
  const user = useUserStore.getState().user;
  const filesRef = collection(db, "files");
  const pageSize = CONFIG.FILES_PAGE_SIZE;
  let q = query(
    filesRef,
    where("owner_id", "==", user.uid),
    where("parent_id", "==", parent_id || null),
    orderBy("created_at", "desc"),
    limit(pageSize)
  );

  if (pageParam) {
    q = query(
      filesRef,
      where("owner_id", "==", user.uid),
      where("parent_id", "==", parent_id || null),
      orderBy("created_at", "desc"),
      startAfter(pageParam),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);

  const files = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      docRef: doc,
    };
  });

  return files;
};
