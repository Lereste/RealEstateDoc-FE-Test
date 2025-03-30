import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  // pure pipes are recalculated only when their input data changes based on reference checks
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string): string {
    if (Array.isArray(value)) {
      value = value[0];
    }

    if (!value) return '';

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Ho_Chi_Minh',
    };

    // Chuyển đổi sang định dạng 'dd/MM/yyyy HH:mm AM/PM'
    let formattedDate = date.toLocaleString('en-GB', options);

    formattedDate = formattedDate.replace(/am|pm/i, (match) =>
      match.toUpperCase()
    );

    return formattedDate.replace(',', '').replace(/\//g, '/');
  }
}
