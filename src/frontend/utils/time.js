export function convertUTCToLocalTime(utcString) {

    const utcDate = new Date(utcString);

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short"
    };

    return new Intl.DateTimeFormat('en-US', options).format(utcDate);
}