// ─── GraphQL Client Service ────────────────────────────────────────────────────
// Mirrors: src/lib/graphql-client.ts in React project
// Uses Angular HttpClient for GraphQL over HTTP

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from './http.service';
import type { GraphQLResponse } from '@app/types/index';
import { environment } from '@environments/environment';

export interface GraphQLQuery<TVariables = Record<string, unknown>> {
  query: string;
  variables?: TVariables;
}

export interface GraphQLMutation<TVariables = Record<string, unknown>> {
  mutation: string;
  variables?: TVariables;
}

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private readonly _http = inject(HttpService);
  private readonly _endpoint = `${environment.apiBaseUrl}/graphql`;

  // ── Query (read) ───────────────────────────────────────────────────────────
  query<T>(options: GraphQLQuery): Observable<T> {
    return this._http
      .post<GraphQLResponse<T>>(this._endpoint, {
        query: options.query,
        variables: options.variables ?? {},
      })
      .pipe(
        map(response => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }
          return response.data;
        }),
      );
  }

  // ── Mutation (write) ───────────────────────────────────────────────────────
  mutate<T>(options: GraphQLMutation): Observable<T> {
    return this._http
      .post<GraphQLResponse<T>>(this._endpoint, {
        query: options.mutation,
        variables: options.variables ?? {},
      })
      .pipe(
        map(response => {
          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }
          return response.data;
        }),
      );
  }
}
