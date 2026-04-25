// ─── Shared Files Component ────────────────────────────────────────────────────
// Mirrors: src/modules/file-manager/pages/SharedFiles in React project
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutGrid,
  lucideList,
  lucideFolder,
  lucideFile,
  lucideFileText,
  lucideImage,
  lucideTrash2,
  lucideChevronRight,
  lucideShare2,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { FileManagerService } from '../../services/file-manager.service';
import { FileItem, FileViewMode } from '../../../../models/file-manager.model';

@Component({
  selector: 'app-shared-files',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DragDropModule,
    NgIconComponent,
    HlmButton,
    HlmInput,
  ],
  viewProviders: [
    provideIcons({
      lucideLayoutGrid,
      lucideList,
      lucideFolder,
      lucideFile,
      lucideFileText,
      lucideImage,
      lucideTrash2,
      lucideChevronRight,
      lucideShare2,
    }),
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Shared Files</h1>
          <nav class="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span class="hover:text-indigo-600 cursor-pointer" (click)="navigateToRoot()"
              >Shared Files</span
            >
            @for (crumb of breadcrumbs(); track crumb.id) {
              <ng-icon name="lucideChevronRight" size="12"></ng-icon>
              <span class="hover:text-indigo-600 cursor-pointer" (click)="navigateTo(crumb.id)">{{
                crumb.name
              }}</span>
            }
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <input
            hlmInput
            [(ngModel)]="searchQuery"
            placeholder="Search shared files..."
            class="w-48 text-sm"
          />

          <div class="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              hlmBtn
              variant="ghost"
              class="rounded-none border-r px-3"
              [class.bg-indigo-50]="viewMode() === 'grid'"
              (click)="viewMode.set('grid')"
            >
              <ng-icon name="lucideLayoutGrid" size="16"></ng-icon>
            </button>
            <button
              hlmBtn
              variant="ghost"
              class="rounded-none px-3"
              [class.bg-indigo-50]="viewMode() === 'list'"
              (click)="viewMode.set('list')"
            >
              <ng-icon name="lucideList" size="16"></ng-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Grid View ───────────────────────────────────────────── -->
      @if (viewMode() === 'grid') {
        <div
          cdkDropList
          (cdkDropListDropped)="onDrop($event)"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4"
        >
          @for (item of filteredFiles(); track item.fileId) {
            <div
              cdkDrag
              (dblclick)="onItemDoubleClick(item)"
              class="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
            >
              <div
                class="w-14 h-14 flex items-center justify-center rounded-lg"
                [class]="getIconBg(item)"
              >
                <ng-icon
                  [name]="getFileIcon(item)"
                  size="28"
                  [class]="getIconColor(item)"
                ></ng-icon>
              </div>
              <span
                class="text-xs text-gray-700 dark:text-gray-300 font-medium text-center truncate w-full"
                >{{ item.name }}</span
              >
              <div class="flex items-center gap-1">
                <ng-icon name="lucideShare2" size="10" class="text-indigo-400"></ng-icon>
                <span class="text-xs text-indigo-400">Shared</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- ── List View ───────────────────────────────────────────── -->
      @if (viewMode() === 'list') {
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Shared
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody cdkDropList (cdkDropListDropped)="onDrop($event)">
              @for (item of filteredFiles(); track item.fileId) {
                <tr
                  cdkDrag
                  (dblclick)="onItemDoubleClick(item)"
                  class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                >
                  <td class="px-6 py-3 flex items-center gap-3">
                    <ng-icon
                      [name]="getFileIcon(item)"
                      size="18"
                      [class]="getIconColor(item)"
                    ></ng-icon>
                    <span class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">{{
                      item.name
                    }}</span>
                  </td>
                  <td class="px-6 py-3 text-gray-500 capitalize">{{ item.type }}</td>
                  <td class="px-6 py-3">
                    <span
                      class="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400"
                    >
                      <ng-icon name="lucideShare2" size="12"></ng-icon> Shared
                    </span>
                  </td>
                  <td class="px-6 py-3 text-gray-500 text-xs">
                    {{ item.createdAt | date: 'mediumDate' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class SharedFilesComponent implements OnInit {
  private readonly fileService = inject(FileManagerService);
  private readonly route = inject(ActivatedRoute);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly viewMode = signal<FileViewMode>('grid');
  readonly files = signal<FileItem[]>([]);
  readonly breadcrumbs = signal<{ id: string; name: string }[]>([]);
  searchQuery = '';

  readonly filteredFiles = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.files();
    return this.files().filter((f) => f.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    const folderId = this.route.snapshot.paramMap.get('folderId');
    this.fileService
      .getFiles({ pageNo: 1, pageSize: 50, parentId: folderId ?? undefined })
      .subscribe((res) => {
        // Show only shared files
        this.files.set(res.items.filter((f) => f.isShared));
      });
  }

  navigateToRoot(): void {
    this.breadcrumbs.set([]);
    this.fileService
      .getFiles({ pageNo: 1, pageSize: 50 })
      .subscribe((res) => this.files.set(res.items.filter((f) => f.isShared)));
  }

  navigateTo(folderId: string): void {
    const idx = this.breadcrumbs().findIndex((b) => b.id === folderId);
    if (idx >= 0) this.breadcrumbs.update((list) => list.slice(0, idx + 1));
    this.fileService
      .getFiles({ pageNo: 1, pageSize: 50, parentId: folderId })
      .subscribe((res) => this.files.set(res.items.filter((f) => f.isShared)));
  }

  onItemDoubleClick(item: FileItem): void {
    if (item.type === 'folder') {
      this.breadcrumbs.update((list) => [...list, { id: item.fileId, name: item.name }]);
      this.fileService
        .getFiles({ pageNo: 1, pageSize: 50, parentId: item.fileId })
        .subscribe((res) => this.files.set(res.items.filter((f) => f.isShared)));
    }
  }

  onDrop(event: CdkDragDrop<FileItem[]>): void {
    const arr = [...this.files()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.files.set(arr);
  }

  getFileIcon(item: FileItem): string {
    if (item.type === 'folder') return 'lucideFolder';
    const mime = item.mimeType ?? '';
    if (mime.startsWith('image/')) return 'lucideImage';
    if (mime.includes('pdf') || mime.includes('text')) return 'lucideFileText';
    return 'lucideFile';
  }

  getIconBg(item: FileItem): string {
    if (item.type === 'folder') return 'bg-amber-50 dark:bg-amber-900/20';
    if (item.mimeType?.startsWith('image/')) return 'bg-purple-50 dark:bg-purple-900/20';
    return 'bg-blue-50 dark:bg-blue-900/20';
  }

  getIconColor(item: FileItem): string {
    if (item.type === 'folder') return 'text-amber-500';
    if (item.mimeType?.startsWith('image/')) return 'text-purple-500';
    return 'text-blue-500';
  }
}
