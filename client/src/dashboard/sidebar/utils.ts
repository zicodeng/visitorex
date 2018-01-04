export const convertToURLFormat = (str: string): string => {
    str = str.toLowerCase().trim();
    str = str.replace(/\s+/g, '-');
    return str;
};
