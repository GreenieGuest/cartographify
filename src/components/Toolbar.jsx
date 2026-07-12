export default function Toolbar() {

    const VIEWS = [
        { id: 'default', label: 'Default (Location)'},
        { id: 'assigned', label: 'Assigned'},
        { id: 'tradeGood', label: 'Trade Goods'},
        { id: 'population', label: 'Population'},
        { id: 'vegetation', label: 'Vegetation'},
        { id: 'terrain', label: 'Topography'},
        { id: 'climate', label: 'Climate'},
        { id: 'owner', label: 'Owner'},
        { id: 'culture', label: 'Culture'},
        { id: 'religion', label: 'Religion'},
        { id: 'harbors', label: 'Harbors'},
        //Hierarchical
        { id: 'continent', label: 'Continent'},
        { id: 'subcontinent', label: 'Subcontinent'},
        { id: 'region', label: 'Region'},
        { id: 'area', label: 'Area'},
        { id: 'province', label: 'Province'},
        { id: 'isCoastal', label: 'Coastal'},
    ]

    return (
        <aside class="left-sidebar">
          <h3>Tools & Data</h3>
        </aside>
    )
}