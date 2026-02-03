export const REGEX_CODE_BLOCK = /```([\s\S]+?)```/g;
export const REGEX_INLINE_CODE = /`([^`]+)`/g;
export const REGEX_BOLD = /\*\*(.*?)\*\*/g;
export const REGEX_ITALIC = /\*(.*?)\*/g;
export const REGEX_NEWLINE = /\n/g;
export const REGEX_ESCAPE_LT = /</g;
export const REGEX_ESCAPE_GT = />/g;

export const REGEX_PROMPT_NEWLINE = /(\r\n|\r|\n){3,}/g;
export const REGEX_TEXT_SPLIT = /\s+/;

export const REGEX_MARKDOWN_CODE_REMOVES_NEWLINE = /\n$/;
export const LANGUAGE_REGEX = /language-(\w+)/;
