import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const DropdownMenuButton = ({
  icon: Icon,
  label,
  className = "",
  ...props
}) => (
  <DropdownMenu.Item
    className={`flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] font-medium rounded-lg
      cursor-pointer outline-none
      text-ink-750 dark:text-ink-300
      hover:bg-ink-75 dark:hover:bg-void-750
      transition-colors duration-100 ${className}`}
    {...props}
  >
    <Icon className="w-[14px] h-[14px] flex-shrink-0 opacity-60" />
    {label}
  </DropdownMenu.Item>
);

export default DropdownMenuButton;

