export class TimeUtil {

    static simpleDate(dateString: Date|string): string {
        let date;
        if (typeof(dateString) == 'string') {
            date = new Date(dateString);
        } else {
            date = dateString;
        }

        let month = this.getMonthName(date.getMonth()),
            day = date.getDate(),
            year = date.getFullYear();

        return month + ' ' + day + ', ' + year;
    }

    static getMonthName(month: number): string {
        switch(month) {
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
        }
    }

    static simpleTime(dateString: string): string {
        let date = new Date(dateString),
            rawHours = date.getHours(),
            mins = date.getMinutes(),
            ampm = rawHours > 11 ? 'pm' : 'am',
            hours = rawHours > 12 ? rawHours - 12 : rawHours;

        return hours + ':' + mins + ' ' + ampm;
    }

    static SECOND_MILLIS = 1000;
    static MINUTE_MILLIS = TimeUtil.SECOND_MILLIS * 60;
    static HOUR_MILLIS = TimeUtil.MINUTE_MILLIS * 60;
    static DAY_MILLIS = TimeUtil.HOUR_MILLIS * 24;

    static isMorning(date: Date): boolean {
        return date.getHours() > 4 && date.getHours() < 12;
    }

    static isAfternoon(date: Date): boolean {
        return date.getHours() >= 12 && date.getHours() < 6;
    }

    static postTime(dateString: string): string {
        let date = new Date(dateString),
            today = new Date(),
            timeDiff = today.getTime() - date.getTime();

        if (timeDiff < this.DAY_MILLIS) {
            if (timeDiff < this.HOUR_MILLIS) {
                if (timeDiff < this.MINUTE_MILLIS * 5) {
                    return 'Just now';
                } else {
                    return Math.round(timeDiff / this.MINUTE_MILLIS) + ' Minutes ago';
                }
            } else {
                return Math.round(timeDiff / this.HOUR_MILLIS) + ' Hours ago';
            }
        } else if (timeDiff < this.DAY_MILLIS * 2) {
            return 'Yesterday';
        } else {
            return this.simpleDate(dateString);
        }
    }

}