import { Feature, FeatureCollection, Geometry } from 'geojson';
import { LocationInfo } from '../models/location-info.model';

export type Geometries = FeatureCollection<Geometry, LocationInfo>;

export type GeoFeature = Feature<Geometry, LocationInfo>;
