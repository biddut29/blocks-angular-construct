// ─── GraphQL for Inventory (same strings as React `react_Constract` inventory module) ─

export const GET_INVENTORY_QUERY = `
  query InventoryItems($input: DynamicQueryInput) {
    getInventoryItems(input: $input) {
      hasNextPage
      hasPreviousPage
      totalCount
      totalPages
      pageSize
      pageNo
      items {
        ItemId
        Category
        CreatedBy
        CreatedDate
        IsDeleted
        Tags
        DeletedDate
        ItemImageFileId
        ItemImageFileIds
        ItemLoc
        ItemName
        Language
        LastUpdatedBy
        LastUpdatedDate
        OrganizationIds
        Price
        Status
        Stock
        Supplier
        EligibleWarranty
        EligibleReplacement
        Discount
      }
    }
  }
`;

export const INSERT_INVENTORY_ITEM_MUTATION = `
  mutation InsertInventoryItem($input: InventoryItemInsertInput!) {
    insertInventoryItem(input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const UPDATE_INVENTORY_ITEM_MUTATION = `
  mutation UpdateInventoryItem($filter: String!, $input: InventoryItemUpdateInput!) {
    updateInventoryItem(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const DELETE_INVENTORY_ITEM_MUTATION = `
  mutation DeleteInventoryItem($filter: String!, $input: InventoryItemDeleteInput!) {
    deleteInventoryItem(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;
