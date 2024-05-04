import { Component, NgModule, Output, Input, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { DxTreeViewModule, DxTreeViewComponent, DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import { navigation } from '../../../app-navigation';  // Import des Navigationsarrays
import * as events from 'devextreme/events';  // Import von DevExtreme Events
import { BoardService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-navigation-menu',  // CSS-Selektor, der diese Komponente in einem Template identifiziert
  templateUrl: './side-navigation-menu.component.html',  // Pfad zur HTML-Template-Datei
  styleUrls: ['./side-navigation-menu.component.scss']  // Pfad zur SCSS-Stylesheet-Datei
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;  // Zugriff auf die DevExtreme TreeView-Komponente im Template

  @Output()
  selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();  // Event, das ausgelöst wird, wenn ein Item ausgewählt wird

  @Output()
  openMenu = new EventEmitter<any>();  // Event, das ausgelöst wird, wenn das Menü geöffnet wird

  private _selectedItem!: String;
  @Input()
  set selectedItem(value: String) {  // Setter für das aktuell ausgewählte Item
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }
    this.menu.instance.selectItem(value);  // Selektiert das Item in der TreeView
  }

  private _items!: Record <string, unknown>[];
  get items() {
    return this._items;
  }

  private _compactMode = false;
  @Input()
  get compactMode() {  // Getter für den Compact-Modus
    return this._compactMode;
  }
  set compactMode(val) {  // Setter für den Compact-Modus
    this._compactMode = val;
    if (!this.menu.instance) {
      return;
    }
    if (val) {
      this.menu.instance.collapseAll();  // Klappt alle Elemente zusammen, wenn Compact-Modus aktiv ist
    } else {
      this.menu.instance.expandItem(this._selectedItem);  // Erweitert das ausgewählte Item
    }
  }

  constructor(private elementRef: ElementRef, private boardService: BoardService, private router: Router) { }  // Konstruktor mit ElementRef-Dependency-Injection

  // boardNames: string[] = [];
  // @Input() private boardNames: Record <string, unknown>[] = [];

  private _boardItem: {
    text: string;
    path: string;
    icon: string;
    items?: undefined;
  } | undefined;

  ngOnInit(): void {
    // this.loadBoards();
    this.boardService.boards$.subscribe(boards => {
      this._items = boards.map(board => ({
        text: board.name,
        path: `/boards/${board.id}`,
        icon: 'folder'  // Anpassen, falls notwendig
      }));
      if (this.menu.instance) {
        this.menu.instance.option('items', this.items);
      }
    });
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    console.log("onclick")
    console.log(event)
    this.menu.instance.selectItem(event.itemData);
    // this.selectedItemChanged.emit(event);  // Löst das selectedItemChanged Event aus
    if (event.itemData && event.itemData["path"]) {
      this.router.navigate([event.itemData["path"]]);
  }
  }

  ngAfterViewInit() {
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);  // Löst das openMenu Event aus, wenn auf das Element geklickt wird
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');  // Entfernt den Event-Listener beim Zerstören der Komponente
  }
}

@NgModule({
  imports: [ DxTreeViewModule ],  // Import des DevExtreme TreeView Moduls
  declarations: [ SideNavigationMenuComponent ],  // Deklaration der Komponente im Modul
  exports: [ SideNavigationMenuComponent ]  // Export der Komponente für die Verwendung in anderen Teilen der Anwendung
})
export class SideNavigationMenuModule { }
