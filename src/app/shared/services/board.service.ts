import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private apiUrl = 'http://localhost:3000/boards'; // Pfad zur API
  private boardsSubject = new BehaviorSubject<any[]>([]);
  public boards$ = this.boardsSubject.asObservable();

  // constructor(private http: HttpClient) { }

  // getBoards(): Observable<any[]> {
  //   return this.http.get<any[]>(this.apiUrl);
  // }

  // getBoardTasks(boardId: string): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/${boardId}/tasks`);
  // }

  // createTask(boardId: string, task: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/${boardId}/tasks`, task);
  // }

  // updateTask(boardId: string, taskId: string, task: any): Observable<any> {
  //   return this.http.patch(`${this.apiUrl}/${boardId}/tasks/${taskId}`, task);
  // }

  // deleteTask(boardId: string, taskId: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/${boardId}/tasks/${taskId}`);
  // }

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.boardsSubject.next(data);
    }, error => {
      console.error('Failed to load initial board data', error);
    });
  }

  createBoard(board: any): Observable<any> {
    return this.http.post(this.apiUrl, board).pipe(
      tap((newBoard) => {
        this.boardsSubject.next([...this.boardsSubject.value, newBoard]);
      }),
      catchError(error => {
        console.error('Insertion failed', error);
        throw 'Insertion failed';
      })
    );
  }

  deleteBoard(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.boardsSubject.next(this.boardsSubject.value.filter(board => board.id !== id));
      }),
      catchError(error => {
        console.error('Deletion failed', error);
        throw 'Deletion failed';
      })
    );
  }
}
