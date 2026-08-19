// 日历组件
function buildCalendar() {
    var grid = document.getElementById('calendar-grid');
    var monthHeader = document.getElementById('calendar-month');
    if (!grid || !monthHeader) return;

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = now.getDate();

    var monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    monthHeader.innerText = monthNames[month] + ' ' + year;

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    grid.innerHTML = '';

    for (var i = 0; i < firstDay; i++) {
        grid.innerHTML += '<span></span>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
        var isToday = d === today ? 'class="today"' : '';
        grid.innerHTML += '<span ' + isToday + '>' + d + '</span>';
    }
}

buildCalendar();
