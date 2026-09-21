interface EmojiButtonProps {
  additionalStyles?: string[];
  buttonText: String;
  onClick: () => void
}

export const EmojiButton = (props: EmojiButtonProps) => {
  const {additionalStyles = [], buttonText, onClick} = props;

  const styles = [
    "px-1",
    "py-1",
    "text-sm",
    "bg-green-500",
    "text-white",
    "text-center",
    "rounded",
    "cursor-pointer",
    "rounded-lg",
    "bg-white",
    "shadow-[0_2px_2px_rgba(0,0,0,0.2)]",
    "hover:border-[#396cd8]",
    "active:border-[#396cd8]",
    "border border-transparent",
    "active:bg-[#e8e8e8]",
    additionalStyles.join(",")
  ];
  return (
    <button type="button" className={styles.join(" ")} onClick={onClick}>
      {buttonText}
    </button>
  );
};
