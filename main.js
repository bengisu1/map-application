const API_URL = 'http://localhost:5237/api/Coordinate';
var vectorSource;
var map;
var popup;
var addingCoordinate = false;
var draw;
var dragInteraction;

let isDrawing = false;

let dataTable;

function initializeDataTable() {
    if ($.fn.DataTable.isDataTable('#coordinatesTable')) {
        $('#coordinatesTable').DataTable().destroy();
    }
    dataTable = $('#coordinatesTable').DataTable({
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'x' },
            { data: 'y' }
        ]
    });
    console.log('DataTable initialized:', dataTable);
}

function getAllCoordinates() {
    console.log('Fetching all coordinates...');
    fetch(`${API_URL}/Get`)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data.isSuccess && Array.isArray(data.data)) {
                console.log(`Found ${data.data.length} coordinates`);
                displayCoordinatesTable(data.data);
                openCoordinatesModal();
            } else {
                console.error('Invalid data format:', data);
                throw new Error('Invalid data format received from server');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert(`Error fetching coordinates: ${error.message}. Please try again.`);
        });
}

function displayCoordinatesTable(coordinates) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.style.display = 'block';
    tableContainer.style.width = '100%';
    tableContainer.style.height = 'auto';
    tableContainer.style.overflow = 'auto';
    console.log('Table container display:', tableContainer.style.display);

    if ($.fn.DataTable.isDataTable('#coordinatesTable')) {
        $('#coordinatesTable').DataTable().destroy();
    }

    $('#coordinatesTable').empty(); // Clear the table

    dataTable = $('#coordinatesTable').DataTable({
        data: coordinates,
        columns: [
            { data: 'name', title: 'Name' },
            {
                data: 'geo',
                title: 'Type',
                render: function (data, type, row) {
                    if (typeof data === 'string') {
                        if (data.startsWith('POINT')) return 'Point';
                        if (data.startsWith('LINESTRING')) return 'LineString';
                        if (data.startsWith('POLYGON')) return 'Polygon';
                    } else if (data && data.wkt) {
                        if (data.wkt.startsWith('POINT')) return 'Point';
                        if (data.wkt.startsWith('LINESTRING')) return 'LineString';
                        if (data.wkt.startsWith('POLYGON')) return 'Polygon';
                    }
                    return 'Unknown';
                }
            },
            {
                data: null,
                title: 'Actions',
                render: function (data, type, row) {
                    let buttons = '<button class="zoom-btn">Zoom</button>' +
                        '<button class="delete-btn">Delete</button>';

                    // Only add the update button for Point types
                    if (row.geo.startsWith('POINT') || (row.geo.wkt && row.geo.wkt.startsWith('POINT'))) {
                        buttons += '<button class="update-btn">Update</button>';
                    }

                    return buttons;
                }
            }
        ],
        paging: true,
        searching: true,
        ordering: true,
        autoWidth: false
    });

    // Add event listeners for the buttons
    $('#coordinatesTable tbody').on('click', 'button.zoom-btn', function () {
        var data = dataTable.row($(this).parents('tr')).data();
        zoomToFeature(data);
        closeCoordinatesModal();
    });

    $('#coordinatesTable tbody').on('click', 'button.update-btn', function () {
        var data = dataTable.row($(this).parents('tr')).data();
        openUpdateModalFromTable(data);
    });

    $('#coordinatesTable tbody').on('click', 'button.delete-btn', function () {
        var data = dataTable.row($(this).parents('tr')).data();
        deleteCoordinateFromTable(data);
    });

    console.log('DataTable rows added:', dataTable.rows().count());
}
function zoomToFeature(data) {
    const feature = vectorSource.getFeatures().find(f => f.get('id') === data.id);
    if (feature) {
        const geometry = feature.getGeometry();
        const extent = geometry.getExtent();
        map.getView().fit(extent, {
            padding: [100, 100, 100, 100],  
            duration: 500,
            maxZoom: 8  
        });
        showPopupForFeature(feature);
        closeCoordinatesModal();
    }
}

function openUpdateModalFromTable(data) {
    console.log('Update data:', data);  // Debugging için

    let wkt;
    if (typeof data.geo === 'string') {
        wkt = data.geo;
    } else if (data.geo && data.geo.wkt) {
        wkt = data.geo.wkt;
    }

    if (wkt) {
        const geometry = new ol.format.WKT().readGeometry(wkt);
        const type = geometry.getType();

        document.getElementById('updateName').value = data.name;

        const updateForm = document.getElementById('updateCoordinateForm');
        updateForm.dataset.id = data.id;
        updateForm.dataset.wkt = wkt;
        updateForm.dataset.type = type;

        if (type === 'Point') {
            const [x, y] = geometry.getCoordinates();
            document.getElementById('updateX').value = x.toFixed(6);
            document.getElementById('updateY').value = y.toFixed(6);
            document.getElementById('updateX').style.display = 'inline-block';
            document.getElementById('updateY').style.display = 'inline-block';
        } else {
            document.getElementById('updateX').style.display = 'none';
            document.getElementById('updateY').style.display = 'none';
        }

        openUpdateModal();
    } else {
        console.error('Invalid geo data:', data.geo);
        alert('Unable to parse coordinate data. Please try again.');
    }
}
function deleteCoordinateFromTable(data) {
    const confirmed = confirm(`Are you sure you want to delete "${data.name}"?`);
    if (confirmed) {
        deleteCoordinate(data.id).then(deleted => {
            if (deleted) {
                const feature = vectorSource.getFeatures().find(f => f.get('id') === data.id);
                if (feature) {
                    vectorSource.removeFeature(feature);
                }
                dataTable.row($(`#coordinatesTable tbody tr:has(td:contains('${data.name}'))`)).remove().draw();
                alert(`Point "${data.name}" has been deleted.`);
            } else {
                alert(`Failed to delete point "${data.name}". Please try again.`);
            }
        });
    }
}


function initializeMap() {
    vectorSource = new ol.source.Vector();

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
    });

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([35.2433, 38.9637]),
            zoom: 6.5,
        })
    });

    createPopup();
    fetchCoordinates();
    map.on('click', handleMapClick);

    // Add draw interactions
    addDrawInteractions();
}



function addDrawInteractions() {
    const typeSelect = document.getElementById('geometryType');

    function addInteraction() {
        const value = typeSelect.value;
        if (value !== 'None') {
            // Mevcut çizim etkileþimini kaldýr
            if (draw) {
                map.removeInteraction(draw);
            }

            draw = new ol.interaction.Draw({
                source: vectorSource,
                type: value
            });
            map.addInteraction(draw);

            draw.on('drawstart', function (event) {
                isDrawing = true;
            });

            draw.on('drawend', function (event) {
                isDrawing = false;
                const feature = event.feature;
                handleDrawEnd(feature);
            });
        } else {
            if (draw) {
                map.removeInteraction(draw);
                draw = null;
            }
        }
    }

    typeSelect.onchange = function () {
        addInteraction();
    };

    addInteraction();
}
function handleDrawEnd(feature) {
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    const name = prompt(`Enter a name for this ${type}:`);
    if (name) {
        const wkt = new ol.format.WKT().writeGeometry(geometry.transform('EPSG:3857', 'EPSG:4326'));
        addGeometry(wkt, name, type).then(newFeature => {
            if (newFeature) {
                // Eski özelliði kaldýr
                vectorSource.removeFeature(feature);
                // Yeni özelliði ekle
                vectorSource.addFeature(newFeature);
                showPopupForFeature(newFeature);

                // Çizim modunu kapat
                stopDrawing();
                // Ekleme modunu kapat
                addingCoordinate = false;
                // "Add Coordinate" butonunun metnini güncelle
                document.getElementById('addCoordinateBtn').textContent = 'Add Coordinate';

                // Geometri tipini seçme kutusunu sýfýrla
                const geometryTypeSelect = document.getElementById('geometryType');
                if (geometryTypeSelect) {
                    geometryTypeSelect.value = 'None';
                }

                // Etkileþimi kaldýr
                if (draw) {
                    map.removeInteraction(draw);
                    draw = null;
                }
            }
        });
    } else {
        vectorSource.removeFeature(feature);
    }
}
function addFeatureFromWKT(wkt, name, id) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    feature.set('name', name);
    feature.set('id', id);
    return feature;
}

async function addGeometry(wkt, name, type) {
    try {
        console.log(`Adding ${type}: WKT=${wkt}, Name=${name}`);
        const response = await fetch(`${API_URL}/Add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, wkt: wkt, type: type }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.isSuccess) {
            const newFeature = addFeatureFromWKT(wkt, name, data.data.id);
            console.log(`${type} added successfully: ID=${data.data.id}`);
            return newFeature;
        } else {
            console.error(`Failed to add ${type}:`, data);
            throw new Error(data.message || `Failed to add ${type}`);
        }
    } catch (error) {
        console.error(`Error adding ${type}:`, error);
        alert(`Failed to add ${type} "${name}". Please try again.`);
        return null;
    }
}
function styleFunction(feature) {
    const geometry = feature.getGeometry();
    const type = geometry.getType();

    switch (type) {
        case 'Point':
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: 'deeppink' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                }),
                text: new ol.style.Text({
                    text: feature.get('name'),
                    font: '13px Times New Roman,sans-serif',
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                    offsetY: -15
                })
            });
        case 'LineString':
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 3
                }),
                text: new ol.style.Text({
                    text: feature.get('name'),
                    font: '13px Times New Roman,sans-serif',
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                    placement: 'line'
                })
            });
        case 'Polygon':
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(0, 255, 0, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'green',
                    width: 2
                }),
                text: new ol.style.Text({
                    text: feature.get('name'),
                    font: '13px Times New Roman,sans-serif',
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                })
            });
        //default:
    }
}

function createPopup() {
    const element = document.createElement('div');
    element.className = 'ol-popup';
    element.innerHTML = '<a href="#" id="popup-closer" class="ol-popup-closer"></a><div id="popup-content"></div>';

    popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });

    map.addOverlay(popup);

    const popupCloser = document.getElementById('popup-closer');
    popupCloser.addEventListener('click', () => {
        popup.setPosition(undefined);
    });
}

function fetchCoordinates() {
    console.log('Fetching coordinates...');
    fetch(`${API_URL}/Get`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data.isSuccess && Array.isArray(data.data)) {
                console.log(`Found ${data.data.length} coordinates`);
                vectorSource.clear();
                data.data.forEach(coord => {
                    if (coord.geo) {
                        const wktString = typeof coord.geo === 'string' ? coord.geo : coord.geo.wkt;
                        if (wktString) {
                            const wktReader = new ol.format.WKT();
                            try {
                                const feature = wktReader.readFeature(wktString, {
                                    dataProjection: 'EPSG:4326',
                                    featureProjection: 'EPSG:3857'
                                });
                                feature.set('id', coord.id);
                                feature.set('name', coord.name);
                                vectorSource.addFeature(feature);
                            } catch (error) {
                                console.error('Error parsing WKT:', error);
                            }
                        } else {
                            console.error('Invalid WKT data:', coord);
                        }
                    } else {
                        console.error('Invalid coordinate data:', coord);
                    }
                });
            } else {
                console.error('Invalid data format:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
}

function addPoint(x, y, name, id) {
    const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([x, y])),
        name: name,
        id: id
    });
    vectorSource.addFeature(feature);
    return feature;
}

async function addCoordinate(x, y, name) {
    try {
        console.log(`Adding coordinate: X=${x}, Y=${y}, Name=${name}`);
        const wkt = `POINT(${x} ${y})`;
        const response = await fetch(`${API_URL}/Add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, wkt: wkt }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.isSuccess) {
            const newFeature = addPoint(x, y, name, data.data.id);
            console.log(`Point added successfully: ID=${data.data.id}`);
            return newFeature;
        } else {
            console.error('Failed to add coordinate:', data);
            throw new Error(data.message || 'Failed to add coordinate');
        }
    } catch (error) {
        console.error('Error adding coordinate:', error);
        alert(`Failed to add point "${name}". Error: ${error.message}`);
        return null;
    }
}
async function deleteCoordinate(id) {
    try {
        const response = await fetch(`${API_URL}/Delete?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.isSuccess) {
            return true;
        } else {
            console.error('Failed to delete coordinate:', data);
            return false;
        }
    } catch (error) {
        console.error('Error deleting coordinate:', error);
        return false;
    }
}

async function updateCoordinate(id, newX, newY, newName, wkt) {
    try {
        console.log(`Updating coordinate: ID=${id}, Name=${newName}, X=${newX}, Y=${newY}, WKT=${wkt}`);
        let body;
        if (newX !== null && newY !== null) {
            // Point için güncelleme
            wkt = `POINT(${newX} ${newY})`;
            body = JSON.stringify({ name: newName, wkt: wkt });
        } else {
            // Diðer geometriler için güncelleme
            body = JSON.stringify({ name: newName, wkt: wkt });
        }

        const response = await fetch(`${API_URL}/Update?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: body,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        if (data.isSuccess) {
            console.log('Update successful on server');
            return true;
        } else {
            throw new Error(data.message || 'Update failed on server');
        }
    } catch (error) {
        console.error('Error updating coordinate:', error);
        return false;
    }
}
function handleCoordinateSubmit(e) {
    e.preventDefault();
    const x = parseFloat(document.getElementById('X').value);
    const y = parseFloat(document.getElementById('Y').value);
    const name = document.getElementById('Name').value;

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn.innerText === 'Add Coordinate') {
        addCoordinate(x, y, name);
    } else if (submitBtn.innerText === 'Update') {
        const id = submitBtn.dataset.id;
        if (!id) {
            alert('Invalid ID for update. Please try again.');
            return;
        }
        console.log('Updating coordinate with ID:', id);
        updateCoordinate(id, x, y, name)
            .then(() => {
                alert(`Point "${name}" has been updated.`);
                submitBtn.innerText = 'Add Coordinate';
                delete submitBtn.dataset.id;
                vectorSource.changed();
                map.render();
            })
            .catch(error => {
                alert(`Failed to update coordinate: ${error.message}`);
            });
    }

    e.target.reset();
    hideCoordinateForm();
}

function handleMapClick(evt) {
    if (dragInteraction || isDrawing) return; // Exit if we're dragging or drawing

    const clickedFeature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);

    if (clickedFeature) {
        showPopupForFeature(clickedFeature);
    } else {
        popup.setPosition(undefined);

        if (addingCoordinate) {
            const coordinate = evt.coordinate;
            const [x, y] = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
            const name = prompt("Enter a name for this point:");
            if (name) {
                addCoordinate(x, y, name)
                    .then((newFeature) => {
                        if (newFeature) {
                            showPopupForFeature(newFeature);
                            alert(`Point "${name}" has been added.`);
                        }
                        stopDrawing();
                        addingCoordinate = false;
                        document.getElementById('addCoordinateBtn').textContent = 'Add Coordinate';
                    })
                    .catch((error) => {
                        alert(`Failed to add point "${name}". Error: ${error.message}`);
                    });
            }
        }
    }
}


function zoomToCoordinate(coordinate) {
    const view = map.getView();
    view.animate({
        center: coordinate,
        zoom: view.getZoom() + 0.5,
        duration: 1000
    });
}

function handleExistingFeatureClick(feature) {
    const id = feature.get('id');
    const name = feature.get('name');
    const coordinates = ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
    const [x, y] = coordinates;

    popup.setPosition(feature.getGeometry().getCoordinates());
    const content = document.getElementById('popup-content');
    content.innerHTML = `
        <div class="coordinate-name">${name}</div>
        <div class="coordinate-xy">X: ${x.toFixed(4)}, Y: ${y.toFixed(4)}</div>
        <button id="delete-btn">Delete</button>
        <button id="update-btn">Update</button>
        <button id="drag-update-btn">Drag Update</button>
    `;

    document.getElementById('drag-update-btn').addEventListener('click', () => toggleDragUpdate(feature));



    document.getElementById('delete-btn').addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete "${name}"?`);
        if (confirmed) {
            const deleted = await deleteCoordinate(id);
            if (deleted) {
                vectorSource.removeFeature(feature);
                popup.setPosition(undefined);
                alert(`Point "${name}" has been deleted.`);
            } else {
                alert(`Failed to delete point "${name}". Please try again.`);
            }
        }
    });

    document.getElementById('update-btn').addEventListener('click', () => {
        document.getElementById('updateX').value = x;
        document.getElementById('updateY').value = y;
        document.getElementById('updateName').value = name;

        const updateForm = document.getElementById('updateCoordinateForm');
        updateForm.dataset.id = id;

        openUpdateModal();
        popup.setPosition(undefined);
    });
}


function toggleDragUpdate(feature) {
    if (dragInteraction) {
        map.removeInteraction(dragInteraction);
        dragInteraction = null;
        return;
    }

    dragInteraction = new ol.interaction.Modify({
        features: new ol.Collection([feature]),
        style: null
    });

    map.addInteraction(dragInteraction);

    let modifiedGeometry;

    dragInteraction.on('modifyend', function (event) {
        const features = event.features.getArray();
        const draggedFeature = features[0];
        modifiedGeometry = draggedFeature.getGeometry().clone();

        if (confirm('Are you sure you want to update?')) {
            const wkt = new ol.format.WKT().writeGeometry(modifiedGeometry.transform('EPSG:3857', 'EPSG:4326'));
            updateCoordinate(draggedFeature.get('id'), null, null, draggedFeature.get('name'), wkt)
                .then(() => {
                    showPopupForFeature(draggedFeature);
                    alert(`${modifiedGeometry.getType()} "${draggedFeature.get('name')}" has been updated.`);
                    fetchCoordinates(); // Refresh the map
                })
                .catch(error => {
                    alert(`Failed to update: ${error.message}`);
                    // Revert the change
                    draggedFeature.setGeometry(modifiedGeometry.transform('EPSG:4326', 'EPSG:3857'));
                });
            map.removeInteraction(dragInteraction);
            dragInteraction = null;
        } else {
            // Continue dragging if the user doesn't confirm
            draggedFeature.setGeometry(modifiedGeometry);
        }
    });
}

function openUpdateModal() {
    document.getElementById('updateCoordinateModal').style.display = 'block';
}

function closeUpdateModal() {
    document.getElementById('updateCoordinateModal').style.display = 'none';
}

async function handleUpdateSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('updateCoordinateForm');
    const id = form.dataset.id;
    const newName = document.getElementById('updateName').value;
    const type = form.dataset.type;

    try {
        let updated;
        if (type === 'Point') {
            const newX = parseFloat(document.getElementById('updateX').value);
            const newY = parseFloat(document.getElementById('updateY').value);
            updated = await updateCoordinate(id, newX, newY, newName);
        } else {
            const wkt = form.dataset.wkt;
            updated = await updateCoordinate(id, null, null, newName, wkt);
        }

        if (updated) {
            alert(`${type} "${newName}" has been updated.`);
            closeUpdateModal();
            fetchCoordinates();  // Haritayý yenile
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error('Failed to update coordinate:', error);
        alert(`Failed to update ${type}: ${error.message}`);
    }
}
function openSearchModal() {
    document.getElementById('searchCoordinateModal').style.display = 'block';
}

function closeSearchModal() {
    document.getElementById('searchCoordinateModal').style.display = 'none';
}

function toggleAddCoordinateMode() {
    addingCoordinate = !addingCoordinate;
    const addCoordinateBtn = document.getElementById('addCoordinateBtn');
    if (addingCoordinate) {
        addCoordinateBtn.textContent = 'Cancel Adding';
        startDrawing();
    } else {
        addCoordinateBtn.textContent = 'Add Coordinate';
        stopDrawing();
    }
}


function startDrawing() {
    draw = new ol.interaction.Draw({
        source: vectorSource,
        type: 'Point'
    });
    map.addInteraction(draw);

    draw.on('drawstart', function (event) {
        const coordinate = event.feature.getGeometry().getCoordinates();
        zoomToCoordinate(coordinate);
    });

    draw.on('drawend', function (event) {
        var feature = event.feature;
        var coordinates = feature.getGeometry().getCoordinates();
        var transformedCoordinates = ol.proj.toLonLat(coordinates);

        console.log('Drawn coordinates:', transformedCoordinates);

        const name = prompt("Enter a name for this point:");
        if (name) {
            addCoordinate(transformedCoordinates[0], transformedCoordinates[1], name)
                .then((newFeature) => {
                    if (newFeature) {
                        showPopupForFeature(newFeature);
                        alert(`Point "${name}" has been added.`);
                    }
                    stopDrawing();
                    addingCoordinate = false;
                    document.getElementById('addCoordinateBtn').textContent = 'Add Coordinate';
                })
                .catch((error) => {
                    alert(`Failed to add point "${name}". Error: ${error.message}`);
                    vectorSource.removeFeature(feature);
                });
        } else {
            vectorSource.removeFeature(feature);
        }
    });
}

function stopDrawing() {
    if (draw) {
        map.removeInteraction(draw);
        draw = null;
    }
}

function showCoordinateForm() {
    document.getElementById('coordinateForm').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async function () {
    await initializeMap();
    document.getElementById('coordinateForm').addEventListener('submit', handleCoordinateSubmit);
    document.getElementById('addCoordinateBtn').addEventListener('click', toggleAddCoordinateMode);
    document.getElementById('updateCoordinateForm').addEventListener('submit', handleUpdateSubmit);
    document.querySelector('#updateCoordinateModal .close').addEventListener('click', closeUpdateModal);
    document.getElementById('searchCoordinateBtn').addEventListener('click', openSearchModal);
    document.querySelector('#searchCoordinateModal .close').addEventListener('click', closeSearchModal);
    document.getElementById('getAllBtn').addEventListener('click', getAllCoordinates);

    const closeButton = document.querySelector('#coordinatesModal .close');
    if (closeButton) {
        closeButton.addEventListener('click', closeCoordinatesModal);
    }

    const searchForm = document.getElementById('searchCoordinateForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    } else {
        console.error('Search form not found');
    }

    initializeDataTable();
});
window.onclick = function (event) {
    const updateModal = document.getElementById('updateCoordinateModal');
    if (event.target === updateModal) {
        updateModal.style.display = "none";
    }
};


function handleSearchSubmit(event) {
    event.preventDefault();
    const searchName = document.getElementById('searchName').value;
    const features = vectorSource.getFeatures();
    const matchingFeature = features.find(f => f.get('name') === searchName);

    if (matchingFeature) {
        const geometry = matchingFeature.getGeometry();
        const extent = geometry.getExtent();

        
        map.getView().fit(extent, {
            padding: [100, 100, 100, 100],  
            duration: 500,
            maxZoom: 8  
        });

        showPopupForFeature(matchingFeature);
        closeSearchModal();
    } else {
        alert('No feature found with this exact name.');
    }
}

function showPopupForFeature(feature) {
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    const name = feature.get('name') || 'Unnamed';

    let content = `
        <div class="coordinate-name">${name}</div>
        <div class="coordinate-type">${type}</div>
    `;
    if (type === 'Point') {
        const [x, y] = ol.proj.transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        content += `<div class="coordinate-xy">X: ${x.toFixed(4)}, Y: ${y.toFixed(4)}</div>`;
        content += `
            <button id="delete-btn">Delete</button>
            <button id="update-btn">Update</button>
            <button id="drag-update-btn">Drag Update</button>
        `;
    } else if (type === 'LineString') {
        const length = ol.sphere.getLength(geometry);
        content += `<div class="coordinate-length">Length: ${length.toFixed(2)} m</div>`;
        content += `
            <button id="delete-btn">Delete</button>
            <button id="drag-update-btn">Drag Update</button>
        `;
    } else if (type === 'Polygon') {
        const area = ol.sphere.getArea(geometry);
        content += `<div class="coordinate-area">Area: ${area.toFixed(2)} m²</div>`;
        content += `
            <button id="delete-btn">Delete</button>
            <button id="drag-update-btn">Drag Update</button>
        `;
    }

    popup.setPosition(geometry.getClosestPoint(map.getView().getCenter()));
    document.getElementById('popup-content').innerHTML = content;

    document.getElementById('delete-btn').addEventListener('click', () => handleDeleteClick(feature));
    if (type === 'Point') {
        document.getElementById('update-btn').addEventListener('click', () => handleUpdateClick(feature));
    }
    document.getElementById('drag-update-btn').addEventListener('click', () => toggleDragUpdate(feature));
}

function handleDeleteClick(feature) {
    const name = feature.get('name');
    const id = feature.get('id');
    const confirmed = confirm(`Are you sure you want to delete "${name}"?`);
    if (confirmed) {
        deleteCoordinate(id).then(deleted => {
            if (deleted) {
                vectorSource.removeFeature(feature);
                popup.setPosition(undefined);
                alert(`Point "${name}" has been deleted.`);
            } else {
                alert(`Failed to delete point "${name}". Please try again.`);
            }
        });
    }
}

function handleUpdateClick(feature) {
    const geometry = feature.getGeometry();
    const coordinates = ol.proj.transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
    document.getElementById('updateX').value = coordinates[0].toFixed(6);
    document.getElementById('updateY').value = coordinates[1].toFixed(6);
    document.getElementById('updateName').value = feature.get('name');

    const updateForm = document.getElementById('updateCoordinateForm');
    updateForm.dataset.id = feature.get('id');
    updateForm.dataset.wkt = new ol.format.WKT().writeGeometry(geometry.clone().transform('EPSG:3857', 'EPSG:4326'));
    updateForm.dataset.type = 'Point';

    openUpdateModal();
    popup.setPosition(undefined);
}

function openCoordinatesModal() {
    document.getElementById('coordinatesModal').style.display = 'block';
}

function closeCoordinatesModal() {
    document.getElementById('coordinatesModal').style.display = 'none';
    if ($.fn.DataTable.isDataTable('#coordinatesTable')) {
        $('#coordinatesTable').DataTable().destroy();
    }
    // Table container'ý gizle
    document.getElementById('tableContainer').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('coordinatesModal');
    if (event.target === modal) {
        closeCoordinatesModal();
    }
};