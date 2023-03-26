export const escapeQuotes = (string) => {
    if (!string || !string.length) return '';
    string = string.replace(/([\\"\\'])/g, '\\' + '$1');
    return string;
};
