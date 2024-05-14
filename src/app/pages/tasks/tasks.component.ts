import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Injectable, NgModule, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DxDataGridComponent, DxTextBoxComponent, DxTextBoxModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import 'devextreme/data/odata/store';
import { Observable, Subject, filter, lastValueFrom, map, of, switchMap, takeUntil } from 'rxjs';
import { BoardService } from 'src/app/shared/services';

@Component({
  templateUrl: 'tasks.component.html',
  styleUrls: ['tasks.component.scss']
})

@Injectable()
export class TasksComponent {
  priority: any[];
  statusDataSource: any[];
  dataSource!: CustomStore;
  boardTitle: string = '';

  isEditingTitle: boolean;
  editedBoardTitle: string = '';

  isDashboardMode: boolean;

  items: any[];
  priorityData: any[];
  dueDateData: any[];
  statusData: any[];


  private destroy$: Subject<void> = new Subject<void>();
  @ViewChild('grid', { static: false }) grid!: DxDataGridComponent;
  @ViewChild('boardTitleTextBox', {static: false}) boardTitleTextBox!: DxTextBoxComponent;

  constructor(
    private httpClient: HttpClient,
    private boardService: BoardService,
    private router: Router,
    private route: ActivatedRoute) {
    this.isEditingTitle = false;
    this.isDashboardMode = false;
    this.priorityData = [];
    this.dueDateData = [];
    this.statusData = [];

    this.items = [{
      ID: 1,
      Name: 'Tasks',
    }, {
      ID: 2,
      Name: 'Dashboard',
    }];

    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];

    this.statusDataSource = [
      { value: 1, name: 'Active' },
      { value: 2, name: 'Pending' },
      { value: 3, name: 'Completed' },
      { value: 4, name: 'Delayed' }
    ];

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if(this.dataSource){
        this.grid.instance.refresh()
        const id = this.route.snapshot.params['id'];

        this.boardService.getBoardTitleById(id).subscribe((title) => {
          this.boardTitle = title;
        });
      }
    });
  }

  ngOnInit(){
    const id = this.route.snapshot.params['id'];
    this.boardService.getBoardTitleById(id).subscribe((title) => {
      this.boardTitle = title;
    });

    this.dataSource = new CustomStore({
      key: 'id',
      loadMode: 'raw',

      load: () => {
        const id = this.route.snapshot.params['id'];
        return lastValueFrom(this.boardService.getTasksForBoard(id))
      },
      insert: (values) => {
        const boardId = this.route.snapshot.params['id'];
        return lastValueFrom(
          this.httpClient.post(`http://localhost:3000/tasks`, { ...values, boardId })
        ).then(() => {
          this.calculateDashboardData();
        })
        .catch(() => { throw 'Insertion failed' });
      },
      remove: async (key) => {
        await lastValueFrom(
          this.httpClient.delete(`http://localhost:3000/tasks/${encodeURIComponent(key)}`)
        ).then(() => {
          this.calculateDashboardData();
        })
        .catch(() => { throw 'Deletion failed' });
      },
      update: (key, values) => {
        return lastValueFrom(
          this.httpClient.patch(`http://localhost:3000/tasks/${encodeURIComponent(key)}`, values)
        ).then(() => {
          this.calculateDashboardData();
        })
        .catch(() => { throw 'Update failed' });
      }
    });

    this.calculateDashboardData();
  }

  private calculateDashboardData(): void{
    this.calculatePriorityData();
    this.calculateDueDateData();
    this.calculateStatusData();
  }

  private async calculatePriorityData() {
    const id = this.route.snapshot.params['id'];
    try {
      const tasks = (await this.boardService.getTasksForBoard(id).toPromise()) ?? [];
      const prioritiesCount: { [key: string]: number } = {
        High: 0,
        Urgent: 0,
        Normal: 0,
        Low: 0
      };

      tasks.forEach(task => {
        switch (task.priority) {
          case 1:
            prioritiesCount['Low']++;
            break;
          case 2:
            prioritiesCount['Normal']++;
            break;
          case 3:
            prioritiesCount['Urgent']++;
            break;
          case 4:
            prioritiesCount['High']++;
            break;
          default:
            break;
        }
      });

      this.priorityData = Object.keys(prioritiesCount).map(key => ({
        name: key,
        value: prioritiesCount[key]
      }));

      console.log(this.priorityData)
    } catch (error) {
      console.error('Failed to fetch tasks for board', error);
    }
  }

  private async calculateStatusData() {
    const id = this.route.snapshot.params['id'];
    try {
      const tasks = (await this.boardService.getTasksForBoard(id).toPromise()) ?? [];
      const statusCount: { [key: string]: number } = {
        Active: 0,
        Pending: 0,
        Completed: 0,
        Delayed: 0
      };

      tasks.forEach(task => {
        switch (task.status) {
          case 1:
            statusCount['Active']++;
            break;
          case 2:
            statusCount['Pending']++;
            break;
          case 3:
            statusCount['Completed']++;
            break;
          case 4:
            statusCount['Delayed']++;
            break;
          default:
            break;
        }
      });

      this.statusData = Object.keys(statusCount).map(key => ({
        name: key,
        value: statusCount[key]
      }));

      console.log(this.statusData);
    } catch (error) {
      console.error('Failed to fetch tasks for board', error);
    }
  }

  private async calculateDueDateData() {
    const id = this.route.snapshot.params['id'];
    try {
      const tasks = (await this.boardService.getTasksForBoard(id).toPromise()) ?? [];
      const dueDateCounts: { [key: string]: number } = {};

      tasks.forEach(task => {
        const dueDate = task.dueDate.split('T')[0]; // Extrahiere das Datumsteil
        if (dueDateCounts[dueDate]) {
          dueDateCounts[dueDate]++;
        } else {
          dueDateCounts[dueDate] = 1;
        }
      });

      this.dueDateData = Object.keys(dueDateCounts).map(date => ({
        date,
        count: dueDateCounts[date]
      }));

      console.log(this.dueDateData);
    } catch (error) {
      console.error('Failed to fetch tasks for board', error);
    }
  }

  public startEditingTitle(): void {
    this.isEditingTitle = true;
    this.editedBoardTitle = this.boardTitle;
  }

  public onBlurIsAddingBoardSet(): void {
    this.boardTitleTextBox.value = '';
    this.isEditingTitle = false;
  }

  public async saveEditedTitle(): Promise<void>{
    const id = this.route.snapshot.params['id'];
    await this.boardService.updateBoardTitle(id, this.boardTitleTextBox.value).subscribe()

    this.boardService.getBoardTitleById(id).subscribe((title) => {
      this.boardTitle = title;
    });

    this.isEditingTitle = false;
  }

  public async deleteBoard(): Promise<void>{
    const id = this.route.snapshot.params['id'];
    await this.boardService.deleteBoard(id).subscribe()
    this.router.navigate([''])
  }

  public onSelectBoxChanged(event: any): void{
    switch(event.value){
      case 1: {
        this.isDashboardMode = false;
        break;
      }
      case 2: {
        this.isDashboardMode = true;
        break;
      }
      default: {
        break;
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
