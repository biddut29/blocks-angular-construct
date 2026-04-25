import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphQLService } from '@lib/graphql.service';
import { GET_INVOICE_ITEMS_QUERY } from '../graphql/queries';
import {
  INSERT_INVOICE_ITEM_MUTATION,
  UPDATE_INVOICE_ITEM_MUTATION,
  DELETE_INVOICE_ITEM_MUTATION,
} from '../graphql/mutations';
import type {
  AddInvoiceItemParams,
  AddInvoiceItemResponse,
  DeleteInvoiceItemResponse,
  InvoiceItemsData,
  UpdateInvoiceItemParams,
  UpdateInvoiceItemResponse,
} from '../types/invoices.types';

type InvoiceItemsWrapper = {
  getInvoiceItems?: InvoiceItemsData;
  InvoiceItems?: InvoiceItemsData;
  invoiceItems?: InvoiceItemsData;
};

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly _gql = inject(GraphQLService);

  getInvoiceItems(args: { pageNo: number; pageSize: number }): Observable<InvoiceItemsData> {
    return this._gql
      .query<InvoiceItemsWrapper>({
        query: GET_INVOICE_ITEMS_QUERY,
        variables: {
          input: {
            filter: '{}',
            sort: '{}',
            pageNo: args.pageNo,
            pageSize: args.pageSize,
          },
        },
      })
      .pipe(
        map((res) => {
          const data = res?.getInvoiceItems ?? res?.InvoiceItems ?? res?.invoiceItems;
          if (!data) {
            throw new Error('Invalid invoice items response structure.');
          }
          return {
            hasNextPage: Boolean(data.hasNextPage ?? false),
            hasPreviousPage: Boolean(data.hasPreviousPage ?? false),
            totalCount: Number(data.totalCount ?? 0),
            totalPages: Number(data.totalPages ?? 0),
            pageSize: Number(data.pageSize ?? args.pageSize),
            pageNo: Number(data.pageNo ?? args.pageNo),
            items: Array.isArray(data.items) ? data.items : [],
          } satisfies InvoiceItemsData;
        })
      );
  }

  addInvoiceItem(params: AddInvoiceItemParams): Observable<AddInvoiceItemResponse> {
    const payload: AddInvoiceItemParams = {
      ...params,
      input: {
        ...params.input,
        Taxes: params.input.Taxes ?? 0,
        Discount: params.input.Discount ?? 0,
      },
    };
    return this._gql.mutate<AddInvoiceItemResponse>({
      mutation: INSERT_INVOICE_ITEM_MUTATION,
      variables: payload as unknown as Record<string, unknown>,
    });
  }

  updateInvoiceItem(params: UpdateInvoiceItemParams): Observable<UpdateInvoiceItemResponse> {
    return this._gql.mutate<UpdateInvoiceItemResponse>({
      mutation: UPDATE_INVOICE_ITEM_MUTATION,
      variables: params as unknown as Record<string, unknown>,
    });
  }

  deleteInvoiceItem(args: {
    filter: string;
    input: { isHardDelete: boolean };
  }): Observable<DeleteInvoiceItemResponse> {
    return this._gql.mutate<DeleteInvoiceItemResponse>({
      mutation: DELETE_INVOICE_ITEM_MUTATION,
      variables: args as unknown as Record<string, unknown>,
    });
  }
}
