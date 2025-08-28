import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";

const notifyTextAreaLimitReached = () => {
  toast.error(
    <div className="flex items-start flex-grow mx-3 text-sm">
      <span className="text-white">
        The message you submitted was too long, please submit something shorter.
      </span>
    </div>,
    {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      pauseOnFocusLoss: false,
      className:
        "w-screen max-w-[660px] bg-[#E02E2A] rounded-lg shadow-lg p-0 pr-4 pl-2",
      bodyClassName: "",
      closeButton: ({ closeToast }) => (
        <button onClick={closeToast} className="text-white hover:text-gray-200">
          <IoClose className="w-4 h-4 text-white flex-shrink-0" />
        </button>
      ),
      icon: false,
    }
  );
};

export { notifyTextAreaLimitReached };
