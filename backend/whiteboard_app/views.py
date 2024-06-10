from django.shortcuts import render, reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponseForbidden, JsonResponse

from .models import Board

def index(request):
    if request.user.is_authenticated:
        boards = request.user.board_set.all()
        return render(request, 'home.html', { 'boards': boards })
    else:
        return render(request, 'index.html')

@login_required
def new_board(request):
    title = request.GET.get('title')
    if not title:
        title = 'New board'
    board = Board(title=title, owner=request.user, board_objects=[])
    board.save()
    return HttpResponseRedirect(reverse('board', args=[board.id]))

@login_required
def board(request, id):
    board = Board.objects.get(id=id)
    if request.user != board.owner:
        return HttpResponseForbidden()
    return render(request, 'board.html', {
        'board_data_url': reverse('get_board_data', args=[id]),
        # 'save_board_url': reverse('save_board', args=[id]),
        'home_page_url': reverse('index')
    })

@login_required
def get_board_data(request, id):
    board = Board.objects.get(id=id)
    if request.user != board.owner:
        return HttpResponseForbidden()
    return JsonResponse({
        'title': board.title,
        'objects': board.board_objects,
    })
