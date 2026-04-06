export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substring(('000000000' + num).length - 9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] !== '00') ? (a[Number(n[1])] || b[n[1][0] as any as number] + ' ' + a[n[1][1] as any as number]) + 'Crore ' : '';
  str += (n[2] !== '00') ? (a[Number(n[2])] || b[n[2][0] as any as number] + ' ' + a[n[2][1] as any as number]) + 'Lakh ' : '';
  str += (n[3] !== '00') ? (a[Number(n[3])] || b[n[3][0] as any as number] + ' ' + a[n[3][1] as any as number]) + 'Thousand ' : '';
  str += (n[4] !== '0') ? (a[Number(n[4])] || b[n[4][0] as any as number] + ' ' + a[n[4][1] as any as number]) + 'Hundred ' : '';
  str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any as number] + ' ' + a[n[5][1] as any as number]) : '';

  return str.trim() + ' Rupees Only';
}
