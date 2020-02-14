/**
 * @module uid
 *
 * @description
 * Client side implementation of the DHIS2 code (uid) generator.
 * ({@link https://github.com/dhis2/dhis2-core/blob/ad2d5dea959aff3146d8fe5796cf0b75eb6ee5d8/dhis-2/dhis-api/src/main/java/org/hisp/dhis/common/CodeGenerator.java|CodeGenerator.java})
 *
 * This module is used to generate and validate DHIS2 uids. A valid DHIS2 uid is a 11 character string which starts with a letter from the ISO basic Latin alphabet.
 */

import moment from 'moment';
import _ from 'lodash';

const abc = 'abcdefghijklmnopqrstuvwxyz';
const letters = abc.concat(abc.toUpperCase());

const ALLOWED_CHARS = `0123456789${letters}`;

const NUMBER_OF_CODEPOINTS = ALLOWED_CHARS.length;
const CODESIZE = 11;

function randomWithMax(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Generate a valid DHIS2 uid. A valid DHIS2 uid is a 11 character string which starts with a letter from the ISO basic Latin alphabet.
 *
 * @return {string} A 11 character uid that always starts with a letter.
 *
 * @example
 * import { generateUid } from 'd2/lib/uid';
 *
 * generateUid();
 */
export const generateUid = () => {
    // First char should be a letter
    let randomChars = letters.charAt(randomWithMax(letters.length));

    for (let i = 1; i < CODESIZE; i += 1) {
        randomChars += ALLOWED_CHARS.charAt(randomWithMax(NUMBER_OF_CODEPOINTS));
    }

    // return new String( randomChars );
    return randomChars;
};

export const units = [{
    "name": "MoH Uganda",
    "id": "akV6429SUqu"
}, {
    "name": "Abim District",
    "id": "NREoMszwQZW"
}, {
    "name": "Adjumani District",
    "id": "QYiQ2KqgCxj"
}, {
    "name": "Agago District",
    "id": "ztIyIYAzFKp"
}, {
    "name": "Alebtong District",
    "id": "p7EEgDEX3jT"
}, {
    "name": "Amolatar District",
    "id": "ZuQHWOaFQVM"
}, {
    "name": "Amudat District",
    "id": "a8RHFdF4DXL"
}, {
    "name": "Amuria District",
    "id": "TM6ccNxawqy"
}, {
    "name": "Amuru District",
    "id": "C0RSe3EWBqU"
}, {
    "name": "Apac District",
    "id": "JyZJhGXKeEq"
}, {
    "name": "Arua District",
    "id": "WcB3kLlgRTb"
}, {
    "name": "Budaka District",
    "id": "kb7iUQISRlx"
}, {
    "name": "Bududa District",
    "id": "AhwgeZQYj16"
}, {
    "name": "Bugiri District",
    "id": "gUaoj8Geuao"
}, {
    "name": "Bugweri District",
    "id": "AIonX4LaJeU"
}, {
    "name": "Buhweju District",
    "id": "sWoNWQZ9qrD"
}, {
    "name": "Buikwe District",
    "id": "x75Yh65MaUa"
}, {
    "name": "Bukedea District",
    "id": "tdZbtg9sZkO"
}, {
    "name": "Bukomansimbi District",
    "id": "Ame30QOwuX6"
}, {
    "name": "Bukwo District",
    "id": "e8m9ZYMRoeR"
}, {
    "name": "Bulambuli District",
    "id": "auLatLbcOxf"
}, {
    "name": "Buliisa District",
    "id": "CQTmrrriwOq"
}, {
    "name": "Bundibugyo District",
    "id": "g8M1cWRJZV6"
}, {
    "name": "Bunyangabu District",
    "id": "iTfbtn6JUsN"
}, {
    "name": "Bushenyi District",
    "id": "It5UGwdHAPF"
}, {
    "name": "Busia District",
    "id": "lkuO79O6mRx"
}, {
    "name": "Butaleja District",
    "id": "MtpE3CH6vq3"
}, {
    "name": "Butambala District",
    "id": "a3LMKP8z8Xj"
}, {
    "name": "Butebo District",
    "id": "FDPqRvcW3NN"
}, {
    "name": "Buvuma District",
    "id": "aZLZPPjqft0"
}, {
    "name": "Buyende District",
    "id": "F3ccON3OCsL"
}, {
    "name": "Dokolo District",
    "id": "wMQ25dybdgH"
}, {
    "name": "Gomba District",
    "id": "lQj3yMM1lI7"
}, {
    "name": "Gulu District",
    "id": "Gwk4wkLz7EW"
}, {
    "name": "Hoima District",
    "id": "PJFtfCyp6Rb"
}, {
    "name": "Ibanda District",
    "id": "r8WLxW9JwsS"
}, {
    "name": "Iganga District",
    "id": "oNxpMjveyZt"
}, {
    "name": "Isingiro District",
    "id": "UaR7OHycj8c"
}, {
    "name": "Jinja District",
    "id": "aJR2ZxSH7g4"
}, {
    "name": "Kaabong District",
    "id": "eOJUW6OGpc7"
}, {
    "name": "Kabale District",
    "id": "zBIpPzKYFLp"
}, {
    "name": "Kabarole District",
    "id": "m77oR1YJESj"
}, {
    "name": "Kaberamaido District",
    "id": "QoRZB7xc3j9"
}, {
    "name": "Kagadi District",
    "id": "orgY0d5MJa9"
}, {
    "name": "Kakumiro District",
    "id": "Lnewt3iIJaK"
}, {
    "name": "Kalaki District",
    "id": "M38KNmhELOH"
}, {
    "name": "Kalangala District",
    "id": "JrHILmtK0OU"
}, {
    "name": "Kaliro District",
    "id": "kJCEJnXLgnh"
}, {
    "name": "Kalungu District",
    "id": "ahyi8Uq4vaj"
}, {
    "name": "Kampala District",
    "id": "aXmBzv61LbM"
}, {
    "name": "Kamuli District",
    "id": "oyygQ2STBST"
}, {
    "name": "Kamwenge District",
    "id": "uCVQXAdKqL9"
}, {
    "name": "Kanungu District",
    "id": "aphcy5JTnd6"
}, {
    "name": "Kapchorwa District",
    "id": "aginheWSLef"
}, {
    "name": "Kapelebyong District",
    "id": "mvN9LBbpf7X"
}, {
    "name": "Karenga District",
    "id": "ZzNu8NVq6pq"
}, {
    "name": "Kasese District",
    "id": "aa8xVDzSpte"
}, {
    "name": "Kassanda District",
    "id": "Pvl4FVXO0RD"
}, {
    "name": "Katakwi District",
    "id": "cSrCFjPKqcG"
}, {
    "name": "Kayunga District",
    "id": "ykxQEnZGXkj"
}, {
    "name": "Kazo District",
    "id": "Dzsu26SwfcD"
}, {
    "name": "Kibaale District",
    "id": "tM3DsJxMaMX"
}, {
    "name": "Kiboga District",
    "id": "GLHh0BXys9w"
}, {
    "name": "Kibuku District",
    "id": "Oyxwe3iDqpR"
}, {
    "name": "Kikuube District",
    "id": "L5WBetpBpY3"
}, {
    "name": "Kiruhura District",
    "id": "qf9xWZu7Dq8"
}, {
    "name": "Kiryandongo District",
    "id": "B0G9cqixld8"
}, {
    "name": "Kisoro District",
    "id": "aPhSZRinfbg"
}, {
    "name": "Kitagwenda District",
    "id": "b3XrQxkEndY"
}, {
    "name": "Kitgum District",
    "id": "pnTVIF5v27r"
}, {
    "name": "Koboko District",
    "id": "iqsaGItA68C"
}, {
    "name": "Kole District",
    "id": "Y4LV8xqkv6J"
}, {
    "name": "Kotido District",
    "id": "aPZzL4CyBTg"
}, {
    "name": "Kumi District",
    "id": "saT18HClZoz"
}, {
    "name": "Kwania District",
    "id": "gCN6sU5BjlR"
}, {
    "name": "Kween District",
    "id": "h1O9AvNR4jS"
}, {
    "name": "Kyankwanzi District",
    "id": "IVuiLJYABw6"
}, {
    "name": "Kyegegwa District",
    "id": "a9tQqo1rSj7"
}, {
    "name": "Kyenjojo District",
    "id": "O9MoQcpZ4uA"
}, {
    "name": "Kyotera District",
    "id": "REJuxCmTwXG"
}, {
    "name": "Lamwo District",
    "id": "xy0M4HhjXtD"
}, {
    "name": "Lira District",
    "id": "Lj8t70RYnEt"
}, {
    "name": "Luuka District",
    "id": "hn1AlYtF1Pu"
}, {
    "name": "Luwero District",
    "id": "tr9XWtYsL5P"
}, {
    "name": "Lwengo District",
    "id": "aqpd0Y9eXZ2"
}, {
    "name": "Lyantonde District",
    "id": "aPRNSGUR3vk"
}, {
    "name": "Madi-Okollo District",
    "id": "COrxpzDJkUi"
}, {
    "name": "Manafwa District",
    "id": "JIZDvNlIhXS"
}, {
    "name": "Maracha District",
    "id": "WyR8Eetj7Uw"
}, {
    "name": "Masaka District",
    "id": "bIONCoCnt3Q"
}, {
    "name": "Masindi District",
    "id": "xr8EMirOASp"
}, {
    "name": "Mayuge District",
    "id": "mv4gKtY0qW8"
}, {
    "name": "Mbale District",
    "id": "yuo5ielNL7W"
}, {
    "name": "Mbarara District",
    "id": "auswb7JO9wY"
}, {
    "name": "Mitooma District",
    "id": "FLygHiUd2UW"
}, {
    "name": "Mityana District",
    "id": "Q7PaNIbyZII"
}, {
    "name": "Moroto District",
    "id": "A9kRCvmn6Co"
}, {
    "name": "Moyo District",
    "id": "W0kQBddyGyh"
}, {
    "name": "Mpigi District",
    "id": "YMMexeHFUay"
}, {
    "name": "Mubende District",
    "id": "lzWuB6bCQeV"
}, {
    "name": "Mukono District",
    "id": "a0DfYpC2Rwl"
}, {
    "name": "Nabilatuk District",
    "id": "mOXva2xiwQv"
}, {
    "name": "Nakapiripirit District",
    "id": "VuHCApXcMTm"
}, {
    "name": "Nakaseke District",
    "id": "aSbgVKaeCP0"
}, {
    "name": "Nakasongola District",
    "id": "aUcYGQCK9ub"
}, {
    "name": "Namayingo District",
    "id": "Ut0ysYGEipO"
}, {
    "name": "Namisindwa District",
    "id": "TGzZPOmbgn8"
}, {
    "name": "Namutumba District",
    "id": "esIUe2tQAtL"
}, {
    "name": "Napak District",
    "id": "EDhGji3EteB"
}, {
    "name": "Nebbi District",
    "id": "Xjc0LDFa5gW"
}, {
    "name": "Ngora District",
    "id": "aj4hsYK3dVm"
}, {
    "name": "Ntoroko District",
    "id": "z8D9ER36EKN"
}, {
    "name": "Ntungamo District",
    "id": "hAoe9dhZh9V"
}, {
    "name": "Nwoya District",
    "id": "zNgVoDVPYgD"
}, {
    "name": "Obongi District",
    "id": "JeOUizncEK9"
}, {
    "name": "Omoro District",
    "id": "S5fvUXgY54J"
}, {
    "name": "Otuke District",
    "id": "aXjub1BYn1y"
}, {
    "name": "Oyam District",
    "id": "xpIFdCMhVHG"
}, {
    "name": "Pader District",
    "id": "aBrjuZk0W31"
}, {
    "name": "Pakwach District",
    "id": "uqUyTPvQKII"
}, {
    "name": "Pallisa District",
    "id": "WiVj4bEhX4P"
}, {
    "name": "Rakai District",
    "id": "P8iz90eiIrW"
}, {
    "name": "Rubanda District",
    "id": "wZrfAgC3WrU"
}, {
    "name": "Rubirizi District",
    "id": "fS71jg1WYPk"
}, {
    "name": "Rukiga District",
    "id": "fsP0Wxie1UW"
}, {
    "name": "Rukungiri District",
    "id": "tugqr4dY6wq"
}, {
    "name": "Rwampara District",
    "id": "shzPAI5Bm7z"
}, {
    "name": "Sembabule District",
    "id": "j7AQsnEYmvi"
}, {
    "name": "Serere District",
    "id": "zJfpujxC1kD"
}, {
    "name": "Sheema District",
    "id": "xAJgEKKAeRA"
}, {
    "name": "Sironko District",
    "id": "wJ2a6YKDFZW"
}, {
    "name": "Soroti District",
    "id": "srmGjHrpVE5"
}, {
    "name": "Tororo District",
    "id": "KhT80mlwJ3Y"
}, {
    "name": "Wakiso District",
    "id": "aIahLLmtvgT"
}, {
    "name": "Yumbe District",
    "id": "W1JM2Qdhcv3"
}, {
    "name": "Zombo District",
    "id": "A4aGXEfdb8P"
}];

export const formatDate = (date) => {
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    const monthString = month < 10 ? '0' + month : month;

    return `${year}${monthString}`
};

export const getMonthsOfQuarter = (quarter) => {
    const splitData = quarter.split('Q');

    let date;
    switch (splitData[1]) {
        case '1':
            date = new Date(splitData[0], 0, 1);
            break;
        case '2':
            date = new Date(splitData[0], 3, 1);
            break;
        case '3':
            date = new Date(splitData[0], 6, 1);
            break;
        case '4':
            date = new Date(splitData[0], 9, 1);
            break;
        default:
            date = new Date();
    }

    let date2 = new Date(date.getFullYear(), date.getMonth() + 1, date.getDay());
    let date3 = new Date(date.getFullYear(), date.getMonth() + 2, date.getDay());
    return [formatDate(date), formatDate(date2), formatDate(date3)].join(';')
};


export const getMonthsOfYear = (year) => {
    let dates = [];
    for (let i = 1; i <= 12; i++) {
        dates = [...dates, `${year}${i < 10 ? '0' + i : i}`]
    }
    return dates.join(';');
};


export const deducePeriodType = (periods) => {
    if (_.isArray(periods) && periods.length > 1) {
        return periods.map(p => p.id).join(';')
    } else if (_.isArray(periods) && periods.length === 1) {
        // let periodType = '';
        const period = periods[0].id
        if (period.indexOf('_QUARTER') !== -1) {
            // periodType = 'Relative Quarter';
            switch (period) {
                case 'THIS_QUARTER':
                    const currentQuarter = moment().format('YYYY[Q]Q');
                    return getMonthsOfQuarter(currentQuarter);
                case 'LAST_QUARTER':
                    const current = moment().quarter() - 1;
                    const lastQuarter = moment().format('YYYY[Q]') + current
                    return getMonthsOfQuarter(lastQuarter);
                default:
                    return periods;
            }
        } else if (period.indexOf('_YEAR') !== -1) {
            // periodType = 'Relative Year';
            switch (period) {
                case 'THIS_YEAR':
                    const currentYear = moment().format('YYYY');
                    console.log(getMonthsOfYear(currentYear));
                    return getMonthsOfYear(currentYear);
                case 'LAST_YEAR':
                    const lastYear = moment().year() - 1;
                    return getMonthsOfYear(lastYear);
                default:
                    return periods;
            }
        } else if (period.length === 4) {
            // periodType = 'Yearly';
            return getMonthsOfYear(period);
        } else if (period.length === 6) {
            if (period.indexOf('Q') !== -1) {
                // periodType = 'Quarterly';
                return getMonthsOfQuarter(period)
            } else if (period.indexOf('S') !== -1) {
                // periodType = 'SixMonthly';
            } else {
                // periodType = 'Monthly';
            }
        } else if (period.length === 7) {
            if (period.indexOf('B') !== -1) {
                // periodType = 'BiMonthly';
            }
            if (period.indexOf('Oct') !== -1) {
                // periodType = 'FinancialOct';
            }
        } else if (period.length === 9) {
            if (period.indexOf('April') !== -1) {
                // periodType = 'FinancialApril';
            }
            if (period.indexOf('_WEEK') !== -1) {
                // periodType = 'Relative Weeks';
            }
        } else {
            if (period.indexOf('AprilS') !== -1) {
                // periodType = 'SixMonthlyApril';
            }
            if (period.indexOf('July') !== -1) {
                // periodType = 'FinancialJuly';
            }
            if (period.indexOf('FINANCIAL_') !== -1) {
                // periodType = 'RelativeFinancialYear';
            }
            if (period.indexOf('_MONTH') !== -1) {
                // periodType = 'RelativeMonth';
            }
            if (period.indexOf('_WEEK') !== -1) {
                // periodType = 'Relative Weeks';
            }

        }

        return periods.map(p => p.id).join(';');
    }

}