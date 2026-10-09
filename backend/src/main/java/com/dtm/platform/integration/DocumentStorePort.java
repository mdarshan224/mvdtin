package com.dtm.platform.integration;import java.util.List;import java.util.Map;
/** Optional external document store boundary. No MongoDB implementation is registered. */
public interface DocumentStorePort {void writeAggregateBatch(List<Map<String,Object>> aggregates);}
