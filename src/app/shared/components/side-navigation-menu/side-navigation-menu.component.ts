import { Component, NgModule, Output, Input, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { DxTreeViewModule, DxTreeViewComponent, DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import * as events from 'devextreme/events';
import { BoardService } from '../../services';
import { Router } from '@angular/router';
import { DxButtonModule, DxMenuModule, DxPopupModule, DxTextBoxComponent, DxTextBoxModule } from 'devextreme-angular';
import { BrowserModule } from '@angular/platform-browser';
import { DxoLabelModule } from 'devextreme-angular/ui/nested';

@Component({
  selector: 'app-side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss']
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;

  @Output()
  selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();

  @Output()
  openMenu = new EventEmitter<any>();

  isAddingBoard: boolean;
  @ViewChild('boardTitleTextBox', {static: false}) boardTitleTextBox!: DxTextBoxComponent;

  private _selectedItem!: String;
  @Input()
  set selectedItem(value: String) {
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }
    this.menu.instance.selectItem(value);
  }

  private _items!: Record <string, unknown>[];
  get items() {
    return this._items;
  }

  private _compactMode = false;
  @Input()
  get compactMode() {
    return this._compactMode;
  }
  set compactMode(val) {
    this._compactMode = val;
    if (!this.menu.instance) {
      return;
    }
    if (val) {
      this.menu.instance.collapseAll();
    } else {
      this.menu.instance.expandItem(this._selectedItem);
    }
  }

  constructor(private elementRef: ElementRef, private boardService: BoardService, private router: Router) {
    this.isAddingBoard = false;
  }

  private _boardItem: {
    text: string;
    path: string;
    icon: string;
    items?: undefined;
  } | undefined;

  ngOnInit(): void {
    this.boardService.boards$.subscribe(boards => {
      this._items = boards.map(board => ({
        text: board.name,
        path: `/boards/${board.id}`,
        icon: 'folder'
      }));
      if (this.menu.instance) {
        this.menu.instance.option('items', this.items);
      }
    });
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    this.menu.instance.selectItem(event.itemData);
    if (event.itemData && event.itemData["path"]) {
      this.router.navigate([event.itemData["path"]]);
  }
  }

  ngAfterViewInit() {
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }

  public startAddingBoard(): void {
    this.isAddingBoard = true;
  }

  public onBlurIsAddingBoardSet(): void {
    this.boardTitleTextBox.value = '';
    this.isAddingBoard = false;
  }

  public async createNewBoard(): Promise<void> {
    await this.boardService.createBoard({name: this.boardTitleTextBox.value}).subscribe()
    this.isAddingBoard = false;
  }

  public onHomeClick(event: any):void {
    this.router.navigate(['/home'])
  }

}

@NgModule({
  imports: [ DxTreeViewModule, DxButtonModule, DxPopupModule, DxTextBoxModule, BrowserModule, DxMenuModule ],
  declarations: [ SideNavigationMenuComponent ],
  exports: [ SideNavigationMenuComponent ]
})
export class SideNavigationMenuModule { }
