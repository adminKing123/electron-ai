import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const DropdownMenuButton = ({
  icon: Icon,
  label,
  className = "",
  ...props
}) => (
  <DropdownMenu.Item
    className={`px-[10px] py-2 text-sm cursor-pointer flex items-center gap-2 outline-none hover:bg-[#454545] rounded-[12px] ${className}`}
    {...props}
  >
    <Icon />
    {label}
  </DropdownMenu.Item>
);

export default DropdownMenuButton;
