import { Injectable, inject } from '@angular/core';
import { GraphQLService } from '@app/lib/graphql.service';
import { Observable, map } from 'rxjs';
import {
  GET_INVENTORY_QUERY,
  INSERT_INVENTORY_ITEM_MUTATION,
  UPDATE_INVENTORY_ITEM_MUTATION,
  DELETE_INVENTORY_ITEM_MUTATION,
} from '../inventory-graphql';
import type {
  AddInventoryItemInputGql,
  DeleteInventoryGqlData,
  GetInventoryGqlData,
  InsertInventoryGqlData,
  UpdateInventoryGqlData,
  UpdateInventoryItemInputGql,
} from '@app/models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly _gql = inject(GraphQLService);

  getInventoryItems(
    pageNo: number,
    pageSize: number
  ): Observable<GetInventoryGqlData['getInventoryItems']> {
    return this._gql
      .query<GetInventoryGqlData>({
        query: GET_INVENTORY_QUERY,
        variables: {
          input: {
            filter: '{}',
            sort: '{}',
            pageNo,
            pageSize,
          },
        },
      })
      .pipe(map((d) => d.getInventoryItems));
  }

  addInventoryItem(input: AddInventoryItemInputGql): Observable<InsertInventoryGqlData> {
    return this._gql.mutate<InsertInventoryGqlData>({
      mutation: INSERT_INVENTORY_ITEM_MUTATION,
      variables: { input },
    });
  }

  updateInventoryItem(
    itemId: string,
    input: UpdateInventoryItemInputGql
  ): Observable<UpdateInventoryGqlData> {
    const filter = `{_id: "${itemId}"}`;
    return this._gql.mutate<UpdateInventoryGqlData>({
      mutation: UPDATE_INVENTORY_ITEM_MUTATION,
      variables: { filter, input },
    });
  }

  deleteInventoryItem(itemId: string, isHardDelete: boolean): Observable<DeleteInventoryGqlData> {
    const filter = `{_id: "${itemId}"}`;
    return this._gql.mutate<DeleteInventoryGqlData>({
      mutation: DELETE_INVENTORY_ITEM_MUTATION,
      variables: { filter, input: { isHardDelete } },
    });
  }
}
