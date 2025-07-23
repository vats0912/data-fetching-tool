import React, { useEffect, useState } from 'react'
import { Loader } from 'lucide-react';
import { Paginator } from 'primereact/paginator';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';


interface Product {
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

function Table() {
  const [page, setPage] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [autoSelective, setAutoSelective] = useState<boolean>(false);
  const [selectCount, setSelectCount] = useState<number>(0);

  const handleSelectRows = () => {
    if (selectCount <= 0) return;
    setSelectedProducts(products.slice(0, selectCount));
    if ((selectCount ?? 0) > products.length) {
    setAutoSelective(true);}
    setPage(1)
  }

  const fetchDataperPage = async () => {
    const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=12`)
    const data = await res.json()
    setProducts(data.data)
    setTotal(data.pagination.total);
    setLimit(data.pagination.limit);

    if(autoSelective){
    const alreadySelectedTitles = new Set(selectedProducts.map((item) => item.title));
    const remaining = (selectCount ?? 0) - selectedProducts.length;
    if (remaining >= 0) {
      const toSelect = data.data.slice(0, remaining);
      const merged = [...selectedProducts, ...toSelect].filter(
        (item, index, self) =>
          index === self.findIndex((i) => i.title === item.title) // deduplicate by title or ID
      );
      setSelectedProducts(merged);
      setAutoSelective(false)
    }
  }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchDataperPage();
      setLoading(false);
    };
    fetchData();
  }, [page]);

  const rowClassName = (rowData: Product) => {
  return {
    'selected-row': selectedProducts.some((item) => item.title === rowData.title),
  };
};


  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen p-6 bg-amber-200 text-blue-400 ">
        
        <Panel header="Row Selector" toggleable className="mb-4 text-md " >
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={selectCount}
                onChange={(e) => setSelectCount(Number(e.target.value))}
                className="px-2 py-1 border rounded w-24 text-black"
                placeholder="Select"
              />

              <button
                onClick={handleSelectRows}
                className="px-4 py-2  rounded  transition"
              >
                Select Rows
              </button>

              <button
                onClick={() => setSelectedProducts([])}
                className="px-4 py-2 transition"
              >
                Clear Selection
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-800">
              Selected: {selectedProducts.length} / {selectCount}
            </p>
           </Panel>
        
          <div className="max-w-7xl mx-auto rounded-lg overflow-hidden border shadow-md text-gray-900">
            <DataTable
              key='title'
              value={products}
              rowClassName={rowClassName}
              selection={selectedProducts.filter((item) =>
                products.some((row) => row.title === item.title)
              )}
              onSelectionChange={(e) => {
                const currentPageData = products;
                const newSelection = e.value;
      
                const filtered = selectedProducts.filter(
                  (item) => !currentPageData.some((row) => row.title === item.title)
                );

                setSelectedProducts([...filtered, ...newSelection]);
              }}

              selectionMode="multiple"
              showGridlines
              responsiveLayout="scroll"
              lazy
              rows={12}
              loading={loading}
              stripedRows
              tableStyle={{ minWidth: '30rem' }}
              className="custom-row-spacing font-semibold border-2 border-blue-200 rounded-lg overflow-hidden justify-between custom-grid-table"
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column field="title" header='Title' style={{ width: '15%' }}   />
              <Column field="place_of_origin" header="Place of Origin" style={{ width: '10%' }} />
              <Column field="artist_display" header="Artist" style={{ width: '25%' }} />
              <Column field="inscriptions" header="Inscriptions" style={{ width: '25%' }} />
              <Column field="date_start" header="Start Date" style={{ width: '10%' }} />
              <Column field="date_end" header="End Date" style={{ width: '10%' }} />
            </DataTable>

          </div>
          <div className='cursor-pointer'>
            <Paginator
              first={(page - 1) * limit}
              rows={limit}
              totalRecords={total}
              onPageChange={(e) => setPage(e.page + 1)}
              className="mt-4 flex justify-center cursor:pointer"
            />
          </div>
        </div>

      )}
    </>
  )
}


export default Table