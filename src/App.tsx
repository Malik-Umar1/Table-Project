import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Artwork {
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

interface PageParams {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]); 
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<PageParams>({
    first: 0,
    rows: 5,
    page: 0,
    pageCount: 0,
  });

  const [numRowsToSelect, setNumRowsToSelect] = useState<number>(1);
  const op = useRef<OverlayPanel>(null);

  useEffect(() => {
    fetchArtworks(page.page, page.rows);
  }, [page]);

  const fetchArtworks = async (pageNumber: number, pageSize: number, append: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}&limit=${pageSize}`
      );
      const jsonData = await response.json();
      const selectedFields = jsonData.data.map((item: any) => ({
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));

      if (append) {
        setAllArtworks((prevArtworks) => [...prevArtworks, ...selectedFields]); 
      } else {
        setArtworks(selectedFields); 
      }

      setTotalRecords(jsonData.pagination.total); 
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const onPageChange = (event: any) => {
    setPage({
      ...event,
      page: event.page,
      rows: event.rows,
    });
  };


useEffect(() => {
  if (numRowsToSelect > 0 && allArtworks.length > 0) {
    const newSelectedArtworks = [...selectedArtworks];
    let rowsRemaining = numRowsToSelect - selectedArtworks.length;
    const selectedIds = newSelectedArtworks.map((row) => row.title);

   
    for (let i = 0; i < allArtworks.length && rowsRemaining > 0; i++) {
      const row = allArtworks[i];
      if (!selectedIds.includes(row.title)) {
        newSelectedArtworks.push(row);
        rowsRemaining--;
      }
    }

    setSelectedArtworks(newSelectedArtworks);
    op.current?.hide();
  }
}, [allArtworks, numRowsToSelect]);


const handleSelectRows = async () => {
  const newSelectedArtworks = [...selectedArtworks];
  let rowsRemaining = numRowsToSelect - newSelectedArtworks.length;


  if (rowsRemaining <= 0) return;

  const totalPagesNeeded = Math.ceil(rowsRemaining / page.rows);
  const currentPage = page.page;

  const fetchPromises = [];
  for (let i = 0; i < totalPagesNeeded && rowsRemaining > 0; i++) {
    const pageToFetch = currentPage + i;
    fetchPromises.push(fetchArtworks(pageToFetch, page.rows, true));
    rowsRemaining -= page.rows;
  }

  await Promise.all(fetchPromises);
};



  return (
    <div className="flex flex-col overflow-x-hidden items-center p-4 sm:p-8 md:p-12 justify-center h-screen space-y-4">
  <h3 className='font-semibold text-lg sm:text-xl md:text-2xl  '>Table with Custom Row Selection</h3>

  <div className="relative w-full overflow-x-auto border-4 rounded-md">
    <DataTable
      selectionMode="multiple"
      selection={selectedArtworks}
      onSelectionChange={(e:any) => setSelectedArtworks(e.value)}
      value={artworks}
      paginator
      rows={page.rows}
      totalRecords={totalRecords}
      lazy
      loading={loading}
      onPage={onPageChange}
      first={page.first}
      className="custom-checkbox p-3 sm:p-5 space-y-1"
      tableStyle={{ minWidth: '600px' }} 
    >
      <Column
        
        
        selectionMode="multiple"
        headerStyle={{ width: '3rem' }}
      />
      <Column header={
          <div className="flex  justify-between  items-center w-full">
            <Button
              icon={<FontAwesomeIcon icon={faChevronDown} />}
              onClick={(e:any) => op.current?.toggle(e)}
              className="p-button-text"
            />
            <OverlayPanel ref={op} className="md:w-80 lg:w-96 rounded-lg top-2">
              <div className="p-3 flex flex-col">
                <h5 className='font-semibold'>Select Rows:</h5>
                <InputNumber
                  value={numRowsToSelect}
                  className='border border-[#35b1ea] p-1 rounded-md'
                  onValueChange={(e:any) => setNumRowsToSelect(e.value ?? 0)}
                  placeholder="Enter number of rows"
                  min={1}
                  max={totalRecords}
                />
                <Button
                  label="Select"
                  className="mt-2 border p-2 rounded-md bg-[#35b1ea] text-white"
                  onClick={handleSelectRows}
                  disabled={numRowsToSelect < 1 || numRowsToSelect > totalRecords}
                />
              </div>
            </OverlayPanel>
          </div>
        }/>
      <Column field="title" header="Title"  className="min-w-[180px] sm:min-w-[230px]" />
      <Column field="place_of_origin" header="Place of Origin" className="min-w-[120px] sm:min-w-[180px]" />
      <Column field="artist_display" header="Artist" className="min-w-[200px] sm:min-w-[280px]" />
      <Column field="inscriptions" header="Inscriptions" className="max-w-[200px] sm:max-w-[430px] truncate whitespace-nowrap" />
      <Column field="date_start" header="Date Start" className="min-w-[100px] sm:min-w-[130px]" />
      <Column field="date_end" header="Date End" className="min-w-[100px] sm:min-w-[130px]" />
    </DataTable>
  </div>
</div>

  );
}

export default App;


