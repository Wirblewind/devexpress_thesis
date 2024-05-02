import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import 'devextreme/data/odata/store';
import { lastValueFrom } from 'rxjs';
import { DataService } from 'src/app/shared/services';

@Component({
  templateUrl: 'tasks.component.html'
})

export class TasksComponent {
  // dataSource: any;
  priority: any[];
  tasks: any[] = [];
  dataSource: CustomStore;

  constructor(private httpClient: HttpClient) {
    this.dataSource = new CustomStore({
      key: 'id',
      loadMode: 'raw',
      
      load: () => {
        return lastValueFrom(this.httpClient.get('http://localhost:3000/task-board-1/'));
      },
      insert: (values) => {
        return lastValueFrom(this.httpClient.post('http://localhost:3000/task-board-1/', JSON.stringify(values)))
          .catch(() => { throw 'Insertion failed' });
      },
      remove: async (key) => {
        await lastValueFrom(this.httpClient.delete('http://localhost:3000/task-board-1/' + encodeURIComponent(key)))
          .catch(() => { throw 'Deletion failed' });
      },
      update: (key, values) => {
        return lastValueFrom(this.httpClient.patch('http://localhost:3000/task-board-1/' + encodeURIComponent(key), values))
          .catch(() => { throw 'Update failed' });
      }
    });
    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];
  }
}
