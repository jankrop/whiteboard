from django.shortcuts import render

def index(request):
    if request.user.is_authenticated:
        boards = request.user.board_set.all()
        return render(request, 'home.html', { 'boards': boards })
    else:
        return render(request, 'index.html')
