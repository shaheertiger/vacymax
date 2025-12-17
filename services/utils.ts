import { VacationBlock } from "../types";

export const parseDateUTC = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') {
        return new Date(Date.UTC(1970, 0, 1)); // Fallback to epoch
    }
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
        return new Date(Date.UTC(1970, 0, 1)); // Fallback for malformed dates
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);

    // Validate parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return new Date(Date.UTC(1970, 0, 1)); // Fallback for NaN values
    }
    return new Date(Date.UTC(year, month, day));
};

export const formatDate = (dateStr: string) => {
    const date = parseDateUTC(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

export const generateGoogleCalendarLink = (block: VacationBlock) => {
    const start = block.startDate.replace(/-/g, '');
    const endDateObj = parseDateUTC(block.endDate);
    endDateObj.setUTCDate(endDateObj.getUTCDate() + 1);
    const end = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

    const title = encodeURIComponent(`Vacation: ${block.description}`);
    const holidayNames = block.publicHolidaysUsed.map(h => h.name).join(', ');
    const details = encodeURIComponent(`Smart Bridge Plan. Holidays used: ${holidayNames}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
};

export const downloadICS = (blocks: VacationBlock[]): boolean => {
    // Input validation
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
        console.warn('No vacation blocks to export');
        return false;
    }

    try {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DoubleMyHolidays//PTO Optimizer//EN\nCALSCALE:GREGORIAN\n";

        blocks.forEach(block => {
            // Validate block data
            if (!block.startDate || !block.endDate) {
                console.warn('Skipping block with missing dates:', block.id);
                return;
            }

            const start = block.startDate.replace(/-/g, '');
            const endDateObj = parseDateUTC(block.endDate);
            endDateObj.setUTCDate(endDateObj.getUTCDate() + 1);
            const end = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

            const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const holidayNames = block.publicHolidaysUsed?.map(h => h.name).join(', ') || '';

            // Escape special characters in text fields
            const safeDescription = (block.description || 'Vacation').replace(/[,;\\]/g, ' ');
            const safeHolidayNames = holidayNames.replace(/[,;\\]/g, ' ');

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `DTSTAMP:${now}\n`;
            icsContent += `DTSTART;VALUE=DATE:${start}\n`;
            icsContent += `DTEND;VALUE=DATE:${end}\n`;
            icsContent += `SUMMARY:Vacation: ${safeDescription}\n`;
            icsContent += `DESCRIPTION:Smart Bridge Plan. Holidays used: ${safeHolidayNames}\n`;
            icsContent += `UID:${block.id || Math.random().toString(36).substr(2, 9)}@doublemyholidays.app\n`;
            icsContent += "END:VEVENT\n";
        });

        icsContent += "END:VCALENDAR";

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'My_Vacation_Plan.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up object URL to prevent memory leaks
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        return true;
    } catch (error) {
        console.error('Failed to generate ICS file:', error);
        return false;
    }
};