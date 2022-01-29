$(function () {
    $(".notice-item").on('mouseenter', '.notice-item-pop', function (event) {
        let target = event.target;
        popContent(target);
    })
    $(".notice-item").delegate('a', 'mouseleave', function (event) {
        let target = event.target;
        $(".pop-content").remove();
    })
})

/**
 * 弹出一个内容
 * */
function popContent(target) {
    let $target = $(target);
    if ($target.is('img')) {
        $target = $target.parent();
    }
    console.log($target);
    let offsetHeight = $target.offset().top - $(window).scrollTop() + $target.height() + 10;
    let offsetLeft = $target.offset().left - $(window).scrollLeft() + $target.width() - 50;
    let html = `<div class="pop-content" style="z-index:999;width:200px;background-color:#fff;box-sizing:content-box;padding:10px;border:1px solid #ccc;position: fixed;top:${offsetHeight}px;left:${offsetLeft}px"><img alt="" width="100%" src="${$target.attr('href')}"/></div>`;
    $('body').append(html);
}
