import React from "react";
import { Handle, useNodeConnections } from "@xyflow/react";
import { FUSE_NODE_HANDLE, FUSE_NODE_HANDLE_CONNECTED } from "../fuseNodeTheme";

const FuseNodeHandle = ({ type, position, id, className = "", style }) => {
  const connections = useNodeConnections(
    id != null ? { handleType: type, handleId: id } : { handleType: type }
  );
  const connected = connections.length > 0;

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      style={style}
      className={[
        "!w-[10px] !h-[10px] !border-2 !rounded-[2px] transition-colors duration-150",
        connected ? FUSE_NODE_HANDLE_CONNECTED : FUSE_NODE_HANDLE,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
};

export default FuseNodeHandle;
