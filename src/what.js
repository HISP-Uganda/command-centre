if (this.currentMapSearch === 'regions') {
    const mrMapUrls = summary.map(d => {
        const h = `${url}?type=${this.currentMapSearch}&search=${d.key}`;
        return axios.get(h)
    });
    const api = this.d2.Api.getApi();

    const { organisationUnits } = await api.get('organisationUnits', { fields: 'id,name', level: 3, paging: false });

    const currentDistricts = fromPairs(organisationUnits.map(child => [child.id, child.name]));

    const opv = await Promise.all(mrMapUrls);

    const intermediate = opv.map(response => {
        const { data: { aggregations: { summary: { buckets: opvSummary } } } } = response;
        return opvSummary.map(d => {

            const denominator = parseInt(d['target_population']['value'], 10);
            const numerator = parseInt(d['children_vaccinated']['value'], 10);
            let value = 0;
            if (!isNaN(denominator) && !isNaN(numerator)) {
                value = denominator !== 0 ? numerator * 100 / denominator : 0
            }
            return [currentDistricts[d.key], value]
        })
    });
    this.mrMapData = flatten(intermediate)
}