export const REGEX_CODE_BLOCK = /```([\s\S]+?)```/g;
export const REGEX_INLINE_CODE = /`([^`]+)`/g;
export const REGEX_BOLD = /\*\*(.*?)\*\*/g;
export const REGEX_ITALIC = /\*(.*?)\*/g;
export const REGEX_NEWLINE = /\n/g;
export const REGEX_ESCAPE_LT = /</g;
export const REGEX_ESCAPE_GT = />/g;

// prompt
export const REGEX_PROMPT_NEWLINE = /(\r\n|\r|\n){3,}/g;
export const REGEX_TEXT_SPLIT = /\s+/;

//Markdown
export const REGEX_MARKDOWN_CODE_REMOVES_NEWLINE = /\n$/; //Removes a single trailing newline from the code string
export const LANGUAGE_REGEX = /language-(\w+)/; //Extracts the language from the className of the code block
