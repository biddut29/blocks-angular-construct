// ─── Trash Component ──────────────────────────────────────────────────────────
// Mirrors: src/modules/file-manager/pages/Trash in React project
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrash2,
  lucideRefreshCw,
  lucideFolder,
  lucideFile,
  lucideFileText,
  lucideImage,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { FileManagerService } from '../../services/file-manager.service';
import { FileItem } from '../../../../models/file-manager.model';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, HlmButton, HlmInput],
  viewProviders: [
    provideIcons({
      lucideTrash2, lucideRefreshCw, lucideFolder, lucideFile,
      lucideFileText, lucideImage, lucideAlertTriangle,
    }),
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Trash</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Items in trash will be permanently deleted after 30 days.</p>
        </div>

        <div class="flex items-center gap-2">
          <input hlmInput [(ngModel)]="searchQuery" placeholder="Search trash..." class="w-48 text-sm" />
          @if (files().length > 0) {
            <button hlmBtn variant="destructive" class="flex items-center gap-2 text-sm" (click)="emptyTrash()">
              <ng-icon name="lucideTrash2" size="16"></ng-icon>
              Empty Trash
            </button>
          }
        </div>
      </div>

      <!-- ── Warning Banner ─────────────────────────────────────── -->
      <div class="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <ng-icon name="lucideAlertTriangle" size="18" class="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"></ng-icon>
        <p class="text-sm text-amber-700 dark:text-amber-300">
          Files in trash are still taking up storage space. Permanently delete them to free up space.
        </p>
      </div>

      <!-- ── Trash Table ─────────────────────────────────────────── -->
      @if (filteredFiles().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <ng-icon name="lucideTrash2" size="28" class="text-gray-400"></ng-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Trash is empty</h3>
          <p class="text-sm text-gray-400">No deleted files found.</p>
        </div>
      } @else {
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredFiles(); track item.fileId) {
                <tr class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-6 py-3 flex items-center gap-3">
                    <ng-icon [name]="getFileIcon(item)" size="18" [class]="getIconColor(item)"></ng-icon>
                    <span class="font-medium text-gray-500 dark:text-gray-400 line-through truncate max-w-xs">{{ item.name }}</span>
                  </td>
                  <td class="px-6 py-3 text-gray-500 capitalize">{{ item.itemKind }}</td>
                  <td class="px-6 py-3 text-gray-500 text-xs">{{ item.updatedAt ?? item.createdAt | date:'mediumDate' }}</td>
                  <td class="px-6 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <!-- Restore -->
                      <button
                        hlmBtn variant="ghost" size="sm"
                        class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700"
                        (click)="restoreFile(item)">
                        <ng-icon name="lucideRefreshCw" size="14"></ng-icon>
                        Restore
                      </button>
                      <!-- Delete Permanently -->
                      <button
                        hlmBtn variant="ghost" size="sm"
                        class="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700"
                        (click)="permanentDelete(item)">
                        <ng-icon name="lucideTrash2" size="14"></ng-icon>
                        Delete
                      </button>
                    </div>
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
export class TrashComponent implements OnInit {
  private readonly fileService = inject(FileManagerService);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly files = signal<FileItem[]>([]);
  searchQuery = '';

  readonly filteredFiles = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.files();
    return this.files().filter(f => f.name.toLowerCase().includes(q));
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.fileService.getFiles({ pageNo: 1, pageSize: 50 }).subscribe(res => {
      // Simulate deleted files by marking them
      const deletedItems = res.items.map(f => ({ ...f, isDeleted: true })).slice(0, 3);
      this.files.set(deletedItems);
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  restoreFile(item: FileItem): void {
    this.fileService.restoreFile(item.fileId).subscribe(() => {
      this.files.update(list => list.filter(f => f.fileId !== item.fileId));
    });
  }

  permanentDelete(item: FileItem): void {
    this.fileService.deleteFile(item.fileId).subscribe(() => {
      this.files.update(list => list.filter(f => f.fileId !== item.fileId));
    });
  }

  emptyTrash(): void {
    const confirmed = confirm('Permanently delete all items in trash? This cannot be undone.');
    if (!confirmed) return;
    const ids = this.files().map(f => f.fileId);
    ids.forEach(id => this.fileService.deleteFile(id).subscribe());
    this.files.set([]);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getFileIcon(item: FileItem): string {
    if (item.type === 'folder') return 'lucideFolder';
    const mime = item.mimeType ?? '';
    if (mime.startsWith('image/')) return 'lucideImage';
    if (mime.includes('pdf') || mime.includes('text')) return 'lucideFileText';
    return 'lucideFile';
  }

  getIconColor(item: FileItem): string {
    return 'text-gray-400';
  }
}
