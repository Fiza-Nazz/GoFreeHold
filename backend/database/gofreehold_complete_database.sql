/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: gofreehold
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `appliances`
--

DROP TABLE IF EXISTS `appliances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appliances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `condition` varchar(30) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appliances_unit_id_foreign` (`unit_id`),
  CONSTRAINT `appliances_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appliances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `appliances` WRITE;
/*!40000 ALTER TABLE `appliances` DISABLE KEYS */;
INSERT INTO `appliances` VALUES
(5,33,'Microwave','Westpoint','RT46K6360SL','SN-SAM-152815','2026-09-09','2026-09-10 05:15:49','2026-09-10 05:15:49','2028-09-10','good','We bought microwave from westpoint company'),
(6,8,'Microwave','Westpoint','19763553','018163779','2026-09-09','2026-09-10 10:05:07','2026-09-10 10:05:07','2027-09-10','brand_new',NULL);
/*!40000 ALTER TABLE `appliances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `bank`
--

DROP TABLE IF EXISTS `bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `bank` WRITE;
/*!40000 ALTER TABLE `bank` DISABLE KEYS */;
INSERT INTO `bank` VALUES
(1,'Emirates NBD','2026-08-21 22:59:27','2026-08-21 22:59:27'),
(2,'Abu Dhabi Commercial Bank (ADCB)','2026-09-03 05:28:11','2026-09-03 05:28:11');
/*!40000 ALTER TABLE `bank` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bank_id` bigint(20) unsigned DEFAULT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `iban` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_accounts_bank_id_foreign` (`bank_id`),
  CONSTRAINT `bank_accounts_bank_id_foreign` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES
(2,1,'GoFreeHold Real Estate Trust A/C','1029384756','AE2902600001029384756','Downtown Dubai Branch','2026-08-21 22:59:27','2026-08-21 22:59:27'),
(3,2,'GoFreeHold Escrow Operations','10023456789','AE260230000100234567890','Business Bay Dubai','2026-09-03 05:28:11','2026-09-03 05:28:11'),
(4,2,'GoFreeHold Escrow Operations','10023456789','AE260230000100234567890','Business Bay Dubai','2026-09-03 05:37:22','2026-09-03 05:37:22');
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `booking_cash_receipts`
--

DROP TABLE IF EXISTS `booking_cash_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_cash_receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `receipt_number` varchar(255) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `receipt_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_cash_receipts_receipt_number_unique` (`receipt_number`),
  KEY `booking_cash_receipts_recorded_by_foreign` (`recorded_by`),
  KEY `booking_cash_receipts_unit_id_receipt_date_index` (`unit_id`,`receipt_date`),
  CONSTRAINT `booking_cash_receipts_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `booking_cash_receipts_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_cash_receipts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `booking_cash_receipts` WRITE;
/*!40000 ALTER TABLE `booking_cash_receipts` DISABLE KEYS */;
INSERT INTO `booking_cash_receipts` VALUES
(1,26,'REC-20260903102629-943','Ayesha',1000.00,'2026-09-03',NULL,1,'2026-09-03 05:26:29','2026-09-03 05:26:29'),
(2,29,'REC-20260903102800-199','Hamdan Al Maktoum',10000.00,'2026-09-03','Advance booking deposit via cash',1,'2026-09-03 05:28:00','2026-09-03 05:28:00'),
(3,30,'REC-20260903103718-334','Hamdan Al Maktoum',10000.00,'2026-09-03','Advance booking deposit via cash',1,'2026-09-03 05:37:18','2026-09-03 05:37:18'),
(4,35,'REC-20260918060721-994','E2E Advance Booker',2500.00,'2026-09-18','Advance deposit cash receipt test',1,'2026-09-18 01:07:21','2026-09-18 01:07:21'),
(5,37,'REC-20260918060932-636','E2E Advance Booker',2500.00,'2026-09-18','Advance deposit cash receipt test',1,'2026-09-18 01:09:32','2026-09-18 01:09:32'),
(6,39,'REC-20260918061142-340','E2E Advance Booker',2500.00,'2026-09-18','Advance deposit cash receipt test',1,'2026-09-18 01:11:42','2026-09-18 01:11:42'),
(7,41,'REC-20260918061357-784','E2E Advance Booker',2500.00,'2026-09-18','Advance deposit cash receipt test',1,'2026-09-18 01:13:57','2026-09-18 01:13:57');
/*!40000 ALTER TABLE `booking_cash_receipts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `call_logs`
--

DROP TABLE IF EXISTS `call_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `call_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `remark` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `logged_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_call_logs_contract_id_foreign` (`contract_id`),
  KEY `contract_call_logs_logged_by_foreign` (`logged_by`),
  CONSTRAINT `contract_call_logs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contract_call_logs_logged_by_foreign` FOREIGN KEY (`logged_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `call_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `call_logs` WRITE;
/*!40000 ALTER TABLE `call_logs` DISABLE KEYS */;
INSERT INTO `call_logs` VALUES
(1,20,'Tenant confirmed handover scheduled for 25 Aug 2026.','2026-08-22',1,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(2,22,'Tenant confirmed handover scheduled for 25 Aug 2026.','2026-08-22',1,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(3,26,'Handed over keys and verified DIB Cheque 1 clearance with tenant executive.','2026-09-01',1,'2026-09-01 04:59:42','2026-09-01 04:59:42'),
(4,26,'Followed up with tenant regarding upcoming lease renewal terms. Confirmed renewal.','2026-09-03',1,'2026-09-03 05:28:07','2026-09-03 05:28:07'),
(5,5,'Followed up with tenant regarding upcoming lease renewal terms. Confirmed renewal.','2026-09-03',1,'2026-09-03 05:37:19','2026-09-03 05:37:19'),
(6,30,'E2E Routine lease confirmation call','2026-09-18',1,'2026-09-18 01:07:30','2026-09-18 01:07:30'),
(7,31,'E2E Routine lease confirmation call','2026-09-18',1,'2026-09-18 01:09:33','2026-09-18 01:09:33'),
(8,32,'E2E Routine lease confirmation call','2026-09-18',1,'2026-09-18 01:11:43','2026-09-18 01:11:43'),
(9,33,'E2E Routine lease confirmation call','2026-09-18',1,'2026-09-18 01:13:58','2026-09-18 01:13:58');
/*!40000 ALTER TABLE `call_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'expense',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(1,'Operations Income','income','2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,'Operations Expense','expense','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','assigned','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `priority` enum('low','medium','high','emergency') NOT NULL DEFAULT 'medium',
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `complaints_unit_id_foreign` (`unit_id`),
  KEY `complaints_assigned_to_foreign` (`assigned_to`),
  KEY `complaints_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `complaints_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `complaints_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `complaints_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES
(1,1,1,'AC not cooling','Bedroom AC weak','resolved',2,'high',NULL,'2026-08-10 04:22:38','2026-09-18 01:09:35'),
(2,1,1,'pipe leakage','pipe leakage in the kicthen','resolved',2,'medium',NULL,'2026-08-11 08:11:55','2026-08-16 14:59:29'),
(3,1,1,'kitchen\'s sink leakage','kitchen\'s sink is leakage','resolved',2,'medium',NULL,'2026-08-16 09:16:32','2026-08-16 14:59:34'),
(4,1,1,'electricity not availabe','electricity is not available','resolved',2,'medium',NULL,'2026-08-16 14:58:30','2026-08-16 14:59:32'),
(5,1,1,'AC Compressor Leaking in 502','Air conditioner is blowing warm air and dripping','in_progress',2,'high',NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44'),
(6,1,1,'Bathroom Sink Drainage Clogged','Water draining very slowly in master bathroom','in_progress',2,'medium','2026-08-17 07:57:44','2026-08-17 07:57:44','2026-08-20 11:48:43'),
(7,1,1,'Intercom Handset Not Ringing','Visitors at main gate cannot ring apartment','resolved',2,'low',NULL,'2026-08-17 07:57:44','2026-08-20 11:49:24'),
(8,1,1,'Main Door Electronic Lock Jammed','Keypad code not unlocking door on 2nd floor','resolved',2,'high',NULL,'2026-08-17 07:57:44','2026-08-20 11:49:19'),
(9,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(10,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07'),
(11,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58'),
(12,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:28:56','2026-08-21 12:28:56'),
(13,1,20,'Chiller AC thermostat not responding','Thermostat is showing error code E4 on master bedroom AC.','resolved',NULL,'medium',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(14,1,22,'Chiller AC thermostat not responding','Thermostat is showing error code E4 on master bedroom AC.','resolved',NULL,'medium',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(15,1,24,'Chiller AC thermostat not responding','Thermostat is showing error code E4 on master bedroom AC.','resolved',NULL,'medium',NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(16,1,1,'Water pressure low in master bathroom','Water flow from shower head is very slow since yesterday evening.','open',NULL,'medium',NULL,'2026-08-21 23:09:54','2026-08-21 23:09:54'),
(17,1,1,'Water heater thermostat failure','Thermostat tripped safety valve in bathroom.','resolved',2,'high',NULL,'2026-08-21 23:12:49','2026-08-21 23:12:49'),
(18,1,1,'Water heater thermostat failure','Thermostat tripped safety valve in bathroom.','in_progress',2,'high',NULL,'2026-08-21 23:13:23','2026-09-03 05:28:12'),
(19,1,5,'saverage issue in washroom','saverage issue in washroom please come and repare it','resolved',23,'medium',NULL,'2026-09-06 02:16:18','2026-09-16 04:07:33'),
(20,1,31,'AC Master Bedroom Cooling Issue','The cooling in the master bedroom is insufficient during midday hours.','resolved',2,'high',NULL,'2026-09-06 11:52:18','2026-09-16 03:51:16'),
(21,2,7,'Ac not cooling','please come in ourflat and see the issue and repare it','open',NULL,'high',NULL,'2026-09-13 22:48:23','2026-09-13 22:48:23'),
(22,1,1,'sink leakage in kicthen','our kitchen\'s sink is leakage.','assigned',2,'medium',NULL,'2026-09-16 09:51:15','2026-09-16 09:56:29'),
(23,1,39,'Master Bathroom Water Heater Failure','Water heater tripped the circuit breaker and requires technician inspection','open',NULL,'high',NULL,'2026-09-18 01:11:45','2026-09-18 01:11:45'),
(24,1,41,'Master Bathroom Water Heater Failure','Water heater tripped the circuit breaker and requires technician inspection','resolved',2,'high',NULL,'2026-09-18 01:14:00','2026-09-18 01:14:01');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_case_docs`
--

DROP TABLE IF EXISTS `contract_case_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_case_docs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_case_docs_contract_id_foreign` (`contract_id`),
  CONSTRAINT `contract_case_docs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_case_docs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_case_docs` WRITE;
/*!40000 ALTER TABLE `contract_case_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_case_docs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_cheques`
--

DROP TABLE IF EXISTS `contract_cheques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_cheques` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `cheque_number` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','cleared','bounced') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `payee_name` varchar(255) DEFAULT NULL,
  `nature` varchar(30) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `cheque_image_path` varchar(255) DEFAULT NULL,
  `cheque_image_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pdc_cheques_contract_id_foreign` (`contract_id`),
  CONSTRAINT `pdc_cheques_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_cheques`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_cheques` WRITE;
/*!40000 ALTER TABLE `contract_cheques` DISABLE KEYS */;
INSERT INTO `contract_cheques` VALUES
(1,1,'CHQ-1001','Emirates NBD',15000.00,'2026-08-15','pending','2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,2,'CHQ-1002','ADCB',20000.00,'2026-08-13','pending','2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,2,'CHQ-165874','Emirates NBD',20000.00,'2026-09-02','cleared','2026-08-18 02:56:41','2026-08-18 02:56:41','First installment PDC',NULL,NULL,NULL,NULL,NULL,NULL),
(4,2,'CHQ-BOUNCE-4303','Dubai Islamic Bank',15000.00,'2026-08-18','bounced','2026-08-18 02:56:41','2026-08-18 02:56:41','Replaced by #CHQ-REPLACE-6453',NULL,NULL,NULL,NULL,NULL,NULL),
(5,2,'CHQ-REPLACE-6453','Mashreq Bank',15000.00,'2026-08-25','bounced','2026-08-18 02:56:41','2026-08-21 11:21:55','Replacement for bounced cheque #CHQ-BOUNCE-4303',NULL,NULL,NULL,NULL,NULL,NULL),
(6,12,'CHQ-88201','Emirates NBD',30000.00,'2026-10-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(7,12,'CHQ-88202','Emirates NBD',30000.00,'2027-01-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(8,12,'CHQ-88203','Emirates NBD',30000.00,'2027-04-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(9,12,'CHQ-88204','Emirates NBD',30000.00,'2027-07-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(10,18,'CHQ-501101','Dubai Islamic Bank',23750.00,'2026-09-01','cleared','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(11,18,'CHQ-501102','Dubai Islamic Bank',23750.00,'2026-12-01','pending','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(12,18,'CHQ-501103','Dubai Islamic Bank',23750.00,'2027-03-01','pending','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(13,18,'CHQ-501104','Dubai Islamic Bank',23750.00,'2027-06-01','pending','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(14,20,'CHQ-501101','Dubai Islamic Bank',23750.00,'2026-09-01','cleared','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(15,20,'CHQ-501102','Dubai Islamic Bank',23750.00,'2026-12-01','pending','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(16,20,'CHQ-501103','Dubai Islamic Bank',23750.00,'2027-03-01','pending','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(17,20,'CHQ-501104','Dubai Islamic Bank',23750.00,'2027-06-01','pending','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(18,22,'CHQ-501101','Dubai Islamic Bank',23750.00,'2026-09-01','cleared','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(19,22,'CHQ-501102','Dubai Islamic Bank',23750.00,'2026-12-01','pending','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(20,22,'CHQ-501103','Dubai Islamic Bank',23750.00,'2027-03-01','pending','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(21,22,'CHQ-501104','Dubai Islamic Bank',23750.00,'2027-06-01','pending','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(22,26,'CHQ-DXB-001','Dubai Islamic Bank',225000.00,'2026-09-01','cleared','2026-09-01 04:59:41','2026-09-01 04:59:42','Funds received in DIB escrow account',NULL,NULL,NULL,NULL,NULL,NULL),
(23,26,'CHQ-DXB-002','Dubai Islamic Bank',225000.00,'2027-03-01','pending','2026-09-01 04:59:41','2026-09-01 04:59:41','Cheque 2 of 2 (H2 Rent)',NULL,NULL,NULL,NULL,NULL,NULL),
(24,26,'CHQ-152806','First Abu Dhabi Bank (FAB)',35000.00,'2026-11-30','pending','2026-09-03 05:28:06','2026-09-03 05:28:06','Q4 PDC instalment',NULL,NULL,NULL,NULL,NULL,NULL),
(25,5,'CHQ-153719','First Abu Dhabi Bank (FAB)',35000.00,'2026-11-30','pending','2026-09-03 05:37:19','2026-09-03 05:37:19','Q4 PDC instalment',NULL,NULL,NULL,NULL,NULL,NULL),
(26,26,'CHQ-DXB-001','Dubai Islamic Bank',450000.00,'2026-09-01','pending','2026-09-07 04:05:22','2026-09-07 04:05:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(27,26,'CHQ-DXB-001','Dubai Islamic Bank',450000.00,'2026-09-01','pending','2026-09-07 04:07:14','2026-09-07 04:07:14',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(28,26,'CHQ-DXB-001','Dubai Islamic Bank',450000.00,'2026-09-01','pending','2026-09-07 04:07:28','2026-09-07 04:07:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(29,26,'CHQ-DXB-001','Dubai Islamic Bank',450000.00,'2026-09-01','pending','2026-09-07 04:15:18','2026-09-07 04:15:18',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(30,28,'CHQ-98124','Emirates NBD',25000.00,'2026-10-01','pending','2026-09-07 04:43:12','2026-09-07 04:43:12',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(31,7,'090908785656','UI Test Bank',10000.00,'2026-09-02','pending','2026-09-11 11:47:15','2026-09-11 11:47:15','UI save verification 20260911','UI Test Holder','UI Test Payee','RENT','CROSS','cheque-attachments/X9G8KugecmshOzTtsPfJtKPX7moBzMGjD3Ht6GZJ.png','cheque-attachment.png'),
(32,26,'CHQ-DXB-001','Dubai Islamic Bank',450000.00,'2026-09-01','pending','2026-09-11 11:56:01','2026-09-11 11:56:01',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(33,29,'09207286209','Bank UAE',50000.00,'2026-09-10','pending','2026-09-11 13:33:08','2026-09-11 13:33:08','Test Remarks','Ayesha','test','RENT','Cross','cheque-attachments/xPJjsZ3Li6OxjZ7dK9VUUnwZ6MSjR3etHuqdJoJl.png','cheque-attachment.png'),
(34,29,'98020289279','Bank',50000.00,'2026-09-12','pending','2026-09-12 01:37:24','2026-09-12 01:37:24','Test Remarks','Tarik','Test','RENT','Cross','cheque-attachments/X467lsNzo6G1zoiJysvN58vixR76NPouJo2Sd5Tx.png','cheque-attachment.png'),
(35,30,'CHQ-E2E-060721','First Abu Dhabi Bank',22500.00,'2026-12-17','pending','2026-09-18 01:07:30','2026-09-18 01:07:30',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(36,31,'CHQ-E2E-060931','First Abu Dhabi Bank',22500.00,'2026-12-17','pending','2026-09-18 01:09:33','2026-09-18 01:09:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(37,32,'CHQ-E2E-061142','First Abu Dhabi Bank',22500.00,'2026-12-17','pending','2026-09-18 01:11:43','2026-09-18 01:11:43',NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(38,33,'CHQ-E2E-061357','First Abu Dhabi Bank',22500.00,'2026-12-17','pending','2026-09-18 01:13:58','2026-09-18 01:13:58',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `contract_cheques` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_docs`
--

DROP TABLE IF EXISTS `contract_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_docs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_docs_contract_id_foreign` (`contract_id`),
  CONSTRAINT `contract_docs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_docs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_docs` WRITE;
/*!40000 ALTER TABLE `contract_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_docs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_payables`
--

DROP TABLE IF EXISTS `contract_payables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_payables` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_payables_contract_id_foreign` (`contract_id`),
  CONSTRAINT `contract_payables_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_payables`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_payables` WRITE;
/*!40000 ALTER TABLE `contract_payables` DISABLE KEYS */;
INSERT INTO `contract_payables` VALUES
(1,26,'Owner Landlord Maintenance Reimbursement',2200.00,'2026-09-20','pending','2026-09-03 05:28:10','2026-09-03 05:28:10'),
(2,5,'Owner Landlord Maintenance Reimbursement',2200.00,'2026-09-20','pending','2026-09-03 05:37:21','2026-09-03 05:37:21');
/*!40000 ALTER TABLE `contract_payables` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `lease_term` varchar(255) DEFAULT NULL,
  `security_deposit` decimal(12,2) NOT NULL,
  `deposit_type` varchar(255) DEFAULT NULL,
  `dewa_deposit` decimal(12,2) DEFAULT NULL,
  `due` decimal(12,2) NOT NULL DEFAULT 0.00,
  `on_case` tinyint(1) NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL DEFAULT 'residential',
  `notes` text DEFAULT NULL,
  `status` enum('active','expired','vacated','settled') NOT NULL DEFAULT 'active',
  `last_renewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tenant_id_image` varchar(255) DEFAULT NULL,
  `owner_id_image` varchar(255) DEFAULT NULL,
  `mode_of_payment` varchar(255) DEFAULT NULL,
  `contract_value` decimal(12,2) DEFAULT NULL,
  `passport_image` varchar(255) DEFAULT NULL,
  `visa_page` varchar(255) DEFAULT NULL,
  `tenant_id_back_image` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `discount_info` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_unit_id_foreign` (`unit_id`),
  KEY `contracts_tenant_id_foreign` (`tenant_id`),
  KEY `contracts_owner_id_foreign` (`owner_id`),
  CONSTRAINT `contracts_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES
(1,1,1,1,'2026-02-10','2026-02-10','2027-02-10','2026-08-01',50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential','nothing just i want Vacate Contract','vacated',NULL,'2026-08-10 04:22:38','2026-08-16 15:17:14',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(2,3,2,1,'2025-09-10','2025-09-10','2026-08-15','2026-08-01',80000.00,NULL,5000.00,NULL,NULL,0.00,1,'residential',NULL,'active',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,NULL,'bank_transfer',NULL,NULL,NULL,NULL,NULL,NULL),
(3,5,3,2,'2025-08-10','2025-08-10','2026-07-31','2026-07-31',120000.00,'12 months',12000.00,NULL,NULL,0.00,0,'residential',NULL,'expired',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,7,2,1,'2025-03-15','2025-03-15','2026-03-14',NULL,130000.00,'11',10833.00,NULL,NULL,0.00,0,'residential','1 Year lease - 3BR Al Barsha 1001 - Samira Malik','active',NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL,NULL,'quarterly',130000.00,NULL,NULL,NULL,NULL,NULL),
(5,9,5,1,NULL,'2025-01-01','2026-12-31',NULL,85000.00,NULL,7083.00,NULL,NULL,0.00,0,'residential','2 Year lease - Al Barsha 502 - Ahmed Al Farsi','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'monthly',85000.00,NULL,NULL,NULL,NULL,NULL),
(6,10,6,1,NULL,'2025-03-15','2026-03-14',NULL,130000.00,NULL,10833.00,NULL,NULL,0.00,0,'residential','1 Year lease - 3BR Al Barsha 1001 - Samira Malik','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'quarterly',130000.00,NULL,NULL,NULL,NULL,NULL),
(7,12,7,2,NULL,'2025-06-01','2027-05-31',NULL,220000.00,NULL,18333.00,NULL,NULL,0.00,0,'commercial','2 Year commercial - DIFC B101 - Raj Kumar Patel','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'yearly',220000.00,NULL,NULL,NULL,NULL,NULL),
(8,14,8,3,NULL,'2024-09-01','2025-08-31',NULL,95000.00,NULL,7917.00,NULL,NULL,0.00,0,'residential','Expired - Jumeirah J01 - Elena Torres','expired',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'monthly',95000.00,NULL,NULL,NULL,NULL,NULL),
(9,15,9,3,NULL,'2025-08-01','2026-07-31',NULL,140000.00,NULL,11667.00,NULL,NULL,0.00,0,'residential','1 Year - Jumeirah J02 - James Osei','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'quarterly',140000.00,NULL,NULL,NULL,NULL,NULL),
(10,18,5,1,NULL,'2025-10-01','2026-09-30',NULL,55000.00,NULL,4583.00,NULL,NULL,0.00,0,'residential','1 Year - Sports City SC201 - Ahmed Al Farsi','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'monthly',55000.00,NULL,NULL,NULL,NULL,NULL),
(11,1,1,1,'2026-08-21','2026-09-01','2027-08-31',NULL,60000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential','Tenant requested 2 keys and 1 parking card.','active',NULL,'2026-08-21 11:53:59','2026-08-21 12:04:34','contracts/QJEjZ0eA4YycDL6kp8hKcWyTQ9vX9ly7fzNywX0W.jpg',NULL,'Cash',60000.00,'contracts/LLvNDeHwr8rYQX3Y9htPNdTLIxYhql67i0FsW7dp.jpg','contracts/2MKbxmsxG1BgwYn7ecbOqEHfsG2yrEKSCzgMaDvz.jpg','contracts/He6t5gbgoWcLwqMW40qYHmsbJRS7WTeHC2tq3L9x.jpg','Rent Discount','5,000 AED discount applied for first year'),
(12,2,1,1,'2026-08-21','2026-10-01','2027-09-30',NULL,120000.00,NULL,10000.00,NULL,NULL,0.00,0,'commercial','Commercial office fitout permitted.','vacated',NULL,'2026-08-21 11:53:59','2026-09-16 14:17:25','contracts/abPjyY2ibRhLv0EaXiAXx56zi75r6FhSm5quybkf.jpg',NULL,'4 Cheques',120000.00,'contracts/ALnjpcHk1ENQsyDGR9I5ewSohmx5ZQu0mSXppGoc.jpg','contracts/d1nWiSwvU8dmxCpGT9B0Q7f8DYQU3eG4Qyh9S4WI.jpg','contracts/aTK5hl4azpUJDq5D5k39h9iYguDkikNyjCzufoop.jpg','Free Months','1 Month Free grace period at start'),
(13,3,1,1,'2026-08-21','2026-11-01','2027-10-31',NULL,36000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential','we are scary in this','vacated',NULL,'2026-08-21 11:53:59','2026-09-06 11:52:46','contracts/GzDVFFKSCSEq3gziXqiaganR4XTyqCdkCvW2ypaz.jpg',NULL,'12 Cheques',36000.00,'contracts/XGth7JGcatFTNWgRoYE8iA5CxfSxd3yS8mt4D6UT.jpg','contracts/erfvDAU1zKWp4up7dEZIJdYXCMD5NG7gsO2BwvQz.jpg','contracts/4IsRE8jB1ICpCK7EOTadhdk1PsfqPrrKJsrzK5dt.jpg','No Discount',NULL),
(14,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(15,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(16,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(17,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:28:55','2026-08-21 12:28:55',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(18,20,1,1,'2026-08-22','2026-09-01','2027-08-31','2026-09-01',95000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:54:31','2026-09-16 14:17:25','contracts/sample_id_front.jpg',NULL,'4 Cheques',95000.00,'contracts/sample_passport.jpg','contracts/sample_visa.jpg','contracts/sample_id_back.jpg','Period Rent Discount','5,000 AED Annual Discount'),
(19,21,1,1,NULL,'2025-01-01','2026-01-01',NULL,50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(20,22,1,1,'2026-08-22','2026-09-01','2027-08-31','2026-09-01',95000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:55:28','2026-09-16 14:17:25','contracts/sample_id_front.jpg',NULL,'4 Cheques',95000.00,'contracts/sample_passport.jpg','contracts/sample_visa.jpg','contracts/sample_id_back.jpg','Period Rent Discount','5,000 AED Annual Discount'),
(21,23,1,1,NULL,'2025-01-01','2026-01-01',NULL,50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(22,24,1,1,'2026-08-22','2026-09-01','2027-08-31','2026-09-01',95000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:59:26','2026-09-16 14:17:25','contracts/sample_id_front.jpg',NULL,'4 Cheques',95000.00,'contracts/sample_passport.jpg','contracts/sample_visa.jpg','contracts/sample_id_back.jpg','Period Rent Discount','5,000 AED Annual Discount'),
(23,25,1,1,NULL,'2025-01-01','2026-01-01',NULL,50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(24,5,1,1,NULL,'2026-08-22','2026-09-22',NULL,20000.00,NULL,100.00,NULL,NULL,0.00,0,'commercial',NULL,'vacated',NULL,'2026-08-21 23:30:19','2026-09-16 14:17:25',NULL,NULL,'cash',1000.00,NULL,NULL,NULL,'Period Rent Discount',NULL),
(25,26,1,6,NULL,'2026-08-25','2026-09-25','2026-08-25',4000.00,'Monthly',1000.00,'CHEQUE',NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-25 08:10:26','2026-09-16 14:17:25',NULL,NULL,'cash',6.00,NULL,NULL,NULL,NULL,'i month free'),
(26,28,10,7,NULL,'2026-09-01','2027-08-31','2026-09-01',450000.00,'Monthly',30000.00,'CHEQUE',NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-01 04:59:41','2026-09-07 04:05:21',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(27,31,1,1,NULL,'2026-09-01','2027-08-31',NULL,130000.00,NULL,6500.00,NULL,NULL,0.00,0,'residential','E2E Real Contract Linking 4 Portals','vacated',NULL,'2026-09-06 11:52:17','2026-09-16 14:17:25',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(28,33,4,5,NULL,'2026-09-06','2026-10-06',NULL,40000.00,NULL,6500.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-06 12:25:15','2026-09-06 12:25:15',NULL,NULL,'cash',NULL,NULL,NULL,NULL,NULL,NULL),
(29,34,11,9,NULL,'2026-09-01','2026-10-09',NULL,50000.00,NULL,4000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-11 13:25:47','2026-09-11 13:25:47',NULL,NULL,'cash',NULL,NULL,NULL,NULL,NULL,NULL),
(30,35,11,9,NULL,'2026-09-18','2027-09-18',NULL,90000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-18 01:07:22','2026-09-18 01:07:22',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(31,37,11,9,NULL,'2026-09-18','2027-09-18',NULL,90000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-18 01:09:32','2026-09-18 01:09:32',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(32,39,1,9,NULL,'2026-09-18','2027-09-18',NULL,90000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-18 01:11:43','2026-09-18 01:11:43',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(33,41,1,1,NULL,'2026-09-18','2027-09-18',NULL,90000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-09-18 01:13:58','2026-09-18 01:13:58',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_category_id_foreign` (`category_id`),
  CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES
(1,2,300.00,'2026-08-10','Supplies','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `financial_entries`
--

DROP TABLE IF EXISTS `financial_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('income','expense','loan') NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `entry_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `financial_entries_contract_id_foreign` (`contract_id`),
  KEY `financial_entries_unit_id_foreign` (`unit_id`),
  KEY `financial_entries_recorded_by_foreign` (`recorded_by`),
  CONSTRAINT `financial_entries_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `financial_entries_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_entries_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_entries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `financial_entries` WRITE;
/*!40000 ALTER TABLE `financial_entries` DISABLE KEYS */;
INSERT INTO `financial_entries` VALUES
(1,'income','Rental Income',23750.00,'2026-08-22','Q3 Rent received for Unit 1402',NULL,NULL,1,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(2,'income','Management Commission',7500.00,'2026-09-03','Property management fee Q3 collection',NULL,NULL,1,'2026-09-03 05:28:11','2026-09-03 05:28:11'),
(3,'income','Management Commission',7500.00,'2026-09-03','Property management fee Q3 collection',NULL,NULL,1,'2026-09-03 05:37:22','2026-09-03 05:37:22');
/*!40000 ALTER TABLE `financial_entries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `incomes`
--

DROP TABLE IF EXISTS `incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `incomes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `incomes_category_id_foreign` (`category_id`),
  CONSTRAINT `incomes_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
INSERT INTO `incomes` VALUES
(1,1,1000.00,'2026-08-10','Misc income','2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,1,4500.00,'2026-09-18','E2E Facility management income','2026-09-18 01:07:32','2026-09-18 01:07:32'),
(3,1,4500.00,'2026-09-18','E2E Facility management income','2026-09-18 01:09:34','2026-09-18 01:09:34'),
(4,1,4500.00,'2026-09-18','E2E Facility management income','2026-09-18 01:11:45','2026-09-18 01:11:45'),
(5,1,4500.00,'2026-09-18','E2E Facility management income','2026-09-18 01:14:00','2026-09-18 01:14:00');
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `location_type` enum('warehouse','unit') NOT NULL,
  `location_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category` varchar(255) DEFAULT NULL,
  `min_stock_alert` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_items_unit_id_foreign` (`unit_id`),
  CONSTRAINT `inventory_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES
(1,'warehouse',0,'AC Filter',12,45.00,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,45.00,'HVAC',5,NULL),
(2,'warehouse',0,'Door Lock Set',3,120.00,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,120.00,'Hardware',5,NULL),
(3,'unit',1,'Water Heater',1,850.00,'2026-08-10 04:22:38','2026-08-10 04:22:38',1,850.00,'Appliance',NULL,NULL),
(4,'warehouse',0,'Smart Thermostat Ecobee 4',15,650.00,'2026-09-03 05:37:23','2026-09-03 05:37:23',NULL,650.00,'Electronics',NULL,'Central warehouse shelf B-4'),
(5,'warehouse',0,'Thermostat 240V 060721',15,85.00,'2026-09-18 01:07:34','2026-09-18 01:07:34',NULL,85.00,'Electrical',5,NULL),
(6,'warehouse',0,'Thermostat 240V 060931',15,85.00,'2026-09-18 01:09:35','2026-09-18 01:09:35',NULL,85.00,'Electrical',5,NULL),
(7,'warehouse',0,'Thermostat 240V 061142',15,85.00,'2026-09-18 01:11:45','2026-09-18 01:11:45',NULL,85.00,'Electrical',5,NULL),
(8,'warehouse',0,'Thermostat 240V 061357',15,85.00,'2026-09-18 01:14:01','2026-09-18 01:14:01',NULL,85.00,'Electrical',5,NULL);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `item_store`
--

DROP TABLE IF EXISTS `item_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_store` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_store_item_id_foreign` (`item_id`),
  CONSTRAINT `item_store_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_store`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `item_store` WRITE;
/*!40000 ALTER TABLE `item_store` DISABLE KEYS */;
INSERT INTO `item_store` VALUES
(1,1,5,'Warehouse','2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,2,50,'Batch received from supplier','2026-09-03 05:28:15','2026-09-03 05:28:15'),
(3,3,50,'Batch received from supplier','2026-09-03 05:37:23','2026-09-03 05:37:23');
/*!40000 ALTER TABLE `item_store` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES
(1,'Split AC','appliance','LG',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,'Heavy Duty Brass Door Lock','Hardware','Yale','High-security cylinder lock','2026-09-03 05:28:14','2026-09-03 05:28:14'),
(3,'Heavy Duty Brass Door Lock','Hardware','Yale','High-security cylinder lock','2026-09-03 05:37:23','2026-09-03 05:37:23');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint(20) unsigned NOT NULL,
  `team_id` bigint(20) unsigned DEFAULT NULL,
  `assigned_to` bigint(20) unsigned NOT NULL,
  `assigned_by` bigint(20) unsigned DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'assigned',
  `scheduled_date` date DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_jobs_complaint_id_foreign` (`complaint_id`),
  KEY `maintenance_jobs_assigned_to_foreign` (`assigned_to`),
  KEY `jobs_team_id_foreign` (`team_id`),
  KEY `jobs_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `jobs_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `jobs_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `maintenance_jobs_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_jobs_complaint_id_foreign` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES
(1,1,5,2,1,'completed','2026-09-18','2026-09-18 06:09:35','Element replaced. Water temperature verified at 55C.','2026-08-10 04:22:38','2026-09-18 01:09:35'),
(2,2,NULL,2,2,'completed',NULL,'2026-08-16 19:59:29',NULL,'2026-08-11 08:12:25','2026-08-16 14:59:29'),
(3,4,NULL,2,2,'completed',NULL,'2026-08-16 19:59:32',NULL,'2026-08-16 14:59:06','2026-08-16 14:59:32'),
(4,3,NULL,2,2,'completed',NULL,'2026-08-16 19:59:34',NULL,'2026-08-16 14:59:12','2026-08-16 14:59:34'),
(5,5,1,2,1,'in_progress','2026-08-18',NULL,'Dispatched technician for inspection','2026-08-17 07:57:44','2026-08-17 07:57:44'),
(6,6,NULL,2,1,'in_progress','2026-08-18',NULL,NULL,'2026-08-17 07:57:44','2026-08-20 11:48:43'),
(7,7,1,2,1,'completed','2026-08-18','2026-08-20 16:49:24','Dispatched technician for inspection','2026-08-17 07:57:44','2026-08-20 11:49:24'),
(8,8,1,2,1,'completed','2026-08-18','2026-08-20 16:49:19','Dispatched technician for inspection','2026-08-17 07:57:44','2026-08-20 11:49:19'),
(9,17,NULL,2,2,'in_progress',NULL,NULL,NULL,'2026-08-21 23:12:49','2026-08-21 23:12:49'),
(10,17,NULL,2,2,'completed',NULL,'2026-08-22 04:12:49',NULL,'2026-08-21 23:12:49','2026-08-21 23:12:49'),
(11,18,NULL,2,2,'in_progress',NULL,NULL,NULL,'2026-08-21 23:13:23','2026-08-21 23:13:23'),
(12,18,NULL,2,2,'completed',NULL,'2026-08-22 04:13:23',NULL,'2026-08-21 23:13:23','2026-08-21 23:13:23'),
(13,18,3,1,1,'assigned',NULL,NULL,'Emergency compressor replacement scheduled','2026-09-03 05:37:23','2026-09-03 05:37:23'),
(14,20,NULL,2,2,'completed',NULL,'2026-09-16 08:51:16','Checked AC and fixed','2026-09-06 11:52:19','2026-09-16 03:51:16'),
(15,19,NULL,23,1,'completed',NULL,'2026-09-16 09:07:33',NULL,'2026-09-16 08:54:33','2026-09-16 04:07:33'),
(16,22,NULL,2,1,'assigned',NULL,NULL,NULL,'2026-09-16 09:56:29','2026-09-16 09:56:29'),
(17,24,7,2,1,'completed','2026-09-18','2026-09-18 06:14:01','Element replaced. Water temperature verified at 55C.','2026-09-18 01:14:00','2026-09-18 01:14:01');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `legal_case_documents`
--

DROP TABLE IF EXISTS `legal_case_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_case_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `legal_case_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `legal_case_documents_legal_case_id_foreign` (`legal_case_id`),
  CONSTRAINT `legal_case_documents_legal_case_id_foreign` FOREIGN KEY (`legal_case_id`) REFERENCES `legal_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_case_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `legal_case_documents` WRITE;
/*!40000 ALTER TABLE `legal_case_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `legal_case_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `legal_cases`
--

DROP TABLE IF EXISTS `legal_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_cases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `settlement_id` bigint(20) unsigned DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `legal_cases_contract_id_foreign` (`contract_id`),
  KEY `legal_cases_settlement_id_foreign` (`settlement_id`),
  KEY `legal_cases_status_index` (`status`),
  CONSTRAINT `legal_cases_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `legal_cases_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_cases`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `legal_cases` WRITE;
/*!40000 ALTER TABLE `legal_cases` DISABLE KEYS */;
INSERT INTO `legal_cases` VALUES
(1,20,NULL,'active','Dubai Rental Dispute Center case filed for non-payment','2026-08-21 22:55:28','2026-08-21 22:55:28'),
(2,22,NULL,'active','Dubai Rental Dispute Center case filed for non-payment','2026-08-21 22:59:27','2026-08-21 22:59:27'),
(3,1,NULL,'open',NULL,'2026-09-03 05:20:30','2026-09-03 05:20:30'),
(4,26,NULL,'open','Dispute notice filed regarding maintenance clause interpretation.','2026-09-03 05:28:07','2026-09-03 05:28:07'),
(5,5,NULL,'open','Dispute notice filed regarding maintenance clause interpretation.','2026-09-03 05:37:19','2026-09-03 05:37:19'),
(6,30,NULL,'open','E2E Automated test legal dispute record','2026-09-18 01:07:30','2026-09-18 01:07:30'),
(7,31,NULL,'closed','Dispute resolved amicably out of court','2026-09-18 01:09:33','2026-09-18 01:09:33'),
(8,32,NULL,'closed','Dispute resolved amicably out of court','2026-09-18 01:11:43','2026-09-18 01:11:43'),
(9,33,NULL,'closed','Dispute resolved amicably out of court','2026-09-18 01:13:59','2026-09-18 01:13:59');
/*!40000 ALTER TABLE `legal_cases` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `maintenance_charges`
--

DROP TABLE IF EXISTS `maintenance_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_charges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_charges_job_id_foreign` (`job_id`),
  KEY `maintenance_charges_unit_id_foreign` (`unit_id`),
  CONSTRAINT `maintenance_charges_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `maintenance_charges_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_charges`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `maintenance_charges` WRITE;
/*!40000 ALTER TABLE `maintenance_charges` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_charges` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `maintenances`
--

DROP TABLE IF EXISTS `maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenances_unit_id_foreign` (`unit_id`),
  CONSTRAINT `maintenances_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `maintenances` WRITE;
/*!40000 ALTER TABLE `maintenances` DISABLE KEYS */;
INSERT INTO `maintenances` VALUES
(1,1,'2026-09-03','Routine quarterly plumbing and water filter inspection',450.00,'2026-09-03 05:28:12','2026-09-03 05:28:12'),
(2,1,'2026-09-03','Routine quarterly plumbing and water filter inspection',450.00,'2026-09-03 05:37:23','2026-09-03 05:37:23');
/*!40000 ALTER TABLE `maintenances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2026_07_27_093512_create_buildings_table',1),
(5,'2026_07_27_093513_create_units_table',1),
(6,'2026_07_27_093515_create_tenants_table',1),
(7,'2026_07_27_093516_create_contracts_table',1),
(8,'2026_07_27_093517_create_payments_table',1),
(9,'2026_07_27_093518_create_rent_ledger_table',1),
(10,'2026_07_27_093519_create_pdc_cheques_table',1),
(11,'2026_07_27_093520_create_complaints_table',1),
(12,'2026_07_27_093521_create_maintenance_jobs_table',1),
(13,'2026_07_27_093522_create_appliances_table',1),
(14,'2026_07_27_093524_create_inventory_items_table',1),
(15,'2026_07_27_093525_create_purchase_orders_table',1),
(16,'2026_07_27_093526_create_legal_cases_table',1),
(17,'2026_07_27_093527_create_contract_call_logs_table',1),
(18,'2026_07_27_093528_create_notifications_log_table',1),
(19,'2026_07_27_095803_create_personal_access_tokens_table',1),
(20,'2026_07_29_050655_create_service_charges_table',1),
(21,'2026_07_29_050657_create_settlements_table',1),
(22,'2026_07_29_050700_create_financial_entries_table',1),
(23,'2026_07_29_050701_create_payment_audit_logs_table',1),
(24,'2026_07_29_050702_create_notification_settings_table',1),
(25,'2026_07_29_050703_alter_tables_to_align_with_models',1),
(26,'2026_07_29_190000_rename_tables_to_real_schema',1),
(27,'2026_07_29_200000_create_missing_real_schema_tables',1),
(28,'2026_07_29_210000_align_columns_with_real_schema',1),
(29,'2026_07_29_220000_drop_legal_cases_table',1),
(30,'2026_07_29_230000_rebuild_rent_transactions_debit_credit',1),
(31,'2026_08_01_040000_add_last_renewed_at_to_contracts_table',1),
(32,'2026_08_01_050000_payments_ledger_soft_delete_and_links',1),
(33,'2026_08_01_060000_add_contract_id_to_settlements_table',1),
(34,'2026_08_05_190000_create_booking_cash_receipts_table',1),
(35,'2026_08_05_190100_create_legal_cases_tables',1),
(36,'2026_08_06_065430_add_extra_fields_to_contracts_table',1),
(37,'2026_08_08_140000_fix_owner_id_foreign_keys_to_owners_table',1),
(38,'2026_09_03_103331_add_notes_to_inventory_items_table',2),
(39,'2026_09_10_000001_add_appliance_details',3),
(40,'2026_09_11_000001_allow_tenants_without_portal_account',4),
(41,'2026_09_11_000002_add_cheque_details_and_attachment',5),
(42,'2026_09_12_000001_add_owner_staff_access',6);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `recipient_email` varchar(255) DEFAULT NULL,
  `days_before_expiry` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
INSERT INTO `notification_settings` VALUES
(1,'contract_expiry',1,'Fizanaazz321@gmail.com',100,'Contract Expiry Alerts (~100 days before expiry)','2026-08-11 08:09:46','2026-09-02 12:37:10'),
(2,'pending_cheques',1,'Fizanaazz321@gmail.com',7,'Pending Cheque Alerts','2026-08-11 08:09:46','2026-09-02 12:41:41'),
(3,'vacant_properties',1,'Fizanaazz321@gmail.com',0,'Vacant Property Weekly Alerts','2026-08-11 08:09:46','2026-09-03 05:32:17'),
(4,'monthly_dues',1,'Fizanaazz321@gmail.com',0,'Monthly Rent Due Posting Alerts','2026-08-11 08:09:46','2026-09-03 05:39:37');
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notifications_log`
--

DROP TABLE IF EXISTS `notifications_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `recipient_id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_log_recipient_id_foreign` (`recipient_id`),
  CONSTRAINT `notifications_log_recipient_id_foreign` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_log`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notifications_log` WRITE;
/*!40000 ALTER TABLE `notifications_log` DISABLE KEYS */;
INSERT INTO `notifications_log` VALUES
(1,'contract_expiry',1,'Expiry alert sent for 7 contracts to admin@gofreehold.ae.','sent','2026-09-02 12:08:09','2026-09-02 12:08:09','2026-09-02 12:08:09'),
(2,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to finance@gofreehold.ae.','sent','2026-09-02 12:08:09','2026-09-02 12:08:09','2026-09-02 12:08:09'),
(3,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-02 12:08:09','2026-09-02 12:08:09','2026-09-02 12:08:09'),
(4,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-02 12:08:09','2026-09-02 12:08:09','2026-09-02 12:08:09'),
(5,'contract_expiry',1,'Expiry alert sent for 7 contracts to admin@gofreehold.ae.','sent','2026-09-02 12:09:36','2026-09-02 12:09:36','2026-09-02 12:09:36'),
(6,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to finance@gofreehold.ae.','sent','2026-09-02 12:09:36','2026-09-02 12:09:36','2026-09-02 12:09:36'),
(7,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-02 12:09:36','2026-09-02 12:09:36','2026-09-02 12:09:36'),
(8,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-02 12:09:36','2026-09-02 12:09:36','2026-09-02 12:09:36'),
(9,'contract_expiry',1,'Expiry alert sent for 7 contracts to admin@gofreehold.ae.','sent','2026-09-02 12:09:49','2026-09-02 12:09:49','2026-09-02 12:09:49'),
(10,'contract_expiry',1,'Expiry alert sent for 7 contracts to admin@gofreehold.ae.','sent','2026-09-02 12:15:16','2026-09-02 12:15:16','2026-09-02 12:15:16'),
(11,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to finance@gofreehold.ae.','sent','2026-09-02 12:15:16','2026-09-02 12:15:16','2026-09-02 12:15:16'),
(12,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-02 12:15:16','2026-09-02 12:15:16','2026-09-02 12:15:16'),
(13,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-02 12:15:16','2026-09-02 12:15:16','2026-09-02 12:15:16'),
(14,'contract_expiry',1,'Expiry alert sent for 7 contracts to admin@gofreehold.ae.','sent','2026-09-02 12:15:29','2026-09-02 12:15:29','2026-09-02 12:15:29'),
(15,'contract_expiry',1,'Expiry alert sent for 7 contracts to admin@gofreehold.ae.','sent','2026-09-02 12:21:14','2026-09-02 12:21:14','2026-09-02 12:21:14'),
(16,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to finance@gofreehold.ae.','sent','2026-09-02 12:21:14','2026-09-02 12:21:14','2026-09-02 12:21:14'),
(17,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-02 12:21:14','2026-09-02 12:21:14','2026-09-02 12:21:14'),
(18,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-02 12:21:14','2026-09-02 12:21:14','2026-09-02 12:21:14'),
(19,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-02 12:23:48','2026-09-02 12:23:48','2026-09-02 12:23:48'),
(20,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-02 12:25:02','2026-09-02 12:25:02','2026-09-02 12:25:02'),
(21,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to finance@gofreehold.ae.','sent','2026-09-02 12:25:02','2026-09-02 12:25:02','2026-09-02 12:25:02'),
(22,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-02 12:25:02','2026-09-02 12:25:02','2026-09-02 12:25:02'),
(23,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-02 12:25:02','2026-09-02 12:25:02','2026-09-02 12:25:02'),
(24,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-02 12:37:16','2026-09-02 12:37:16','2026-09-02 12:37:16'),
(25,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-02 12:40:01','2026-09-02 12:40:01','2026-09-02 12:40:01'),
(26,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to Fizanaazz321@gmail.com.','sent','2026-09-02 12:41:45','2026-09-02 12:41:45','2026-09-02 12:41:45'),
(27,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 04:55:20','2026-09-03 04:55:21','2026-09-03 04:55:21'),
(28,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:01:43','2026-09-03 05:01:43','2026-09-03 05:01:43'),
(29,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:20:37','2026-09-03 05:20:37','2026-09-03 05:20:37'),
(30,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:20:41','2026-09-03 05:20:41','2026-09-03 05:20:41'),
(31,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to Fizanaazz321@gmail.com.','sent','2026-09-03 05:20:43','2026-09-03 05:20:43','2026-09-03 05:20:43'),
(32,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-03 05:20:48','2026-09-03 05:20:48','2026-09-03 05:20:48'),
(33,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-03 05:20:50','2026-09-03 05:20:50','2026-09-03 05:20:50'),
(34,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:28:23','2026-09-03 05:28:23','2026-09-03 05:28:23'),
(35,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:28:30','2026-09-03 05:28:30','2026-09-03 05:28:30'),
(36,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to Fizanaazz321@gmail.com.','sent','2026-09-03 05:28:31','2026-09-03 05:28:31','2026-09-03 05:28:31'),
(37,'vacant_properties',1,'Vacant properties alert sent for 10 units to admin@gofreehold.ae.','sent','2026-09-03 05:28:33','2026-09-03 05:28:33','2026-09-03 05:28:33'),
(38,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-03 05:28:34','2026-09-03 05:28:34','2026-09-03 05:28:34'),
(39,'vacant_properties',1,'Vacant properties alert sent for 10 units to Fizanaazz321@gmail.com.','sent','2026-09-03 05:32:21','2026-09-03 05:32:21','2026-09-03 05:32:21'),
(40,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:37:28','2026-09-03 05:37:28','2026-09-03 05:37:28'),
(41,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:37:32','2026-09-03 05:37:32','2026-09-03 05:37:32'),
(42,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to Fizanaazz321@gmail.com.','sent','2026-09-03 05:37:33','2026-09-03 05:37:33','2026-09-03 05:37:33'),
(43,'vacant_properties',1,'Vacant properties alert sent for 10 units to Fizanaazz321@gmail.com.','sent','2026-09-03 05:37:35','2026-09-03 05:37:35','2026-09-03 05:37:35'),
(44,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to billing@gofreehold.ae.','sent','2026-09-03 05:37:36','2026-09-03 05:37:36','2026-09-03 05:37:36'),
(45,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 05:39:41','2026-09-03 05:39:41','2026-09-03 05:39:41'),
(46,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 09:19:38','2026-09-03 09:19:38','2026-09-03 09:19:38'),
(47,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to Fizanaazz321@gmail.com.','sent','2026-09-03 09:19:39','2026-09-03 09:19:39','2026-09-03 09:19:39'),
(48,'vacant_properties',1,'Vacant properties alert sent for 11 units to Fizanaazz321@gmail.com.','sent','2026-09-03 09:19:42','2026-09-03 09:19:42','2026-09-03 09:19:42'),
(49,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to Fizanaazz321@gmail.com.','sent','2026-09-03 09:19:43','2026-09-03 09:19:43','2026-09-03 09:19:43'),
(50,'contract_expiry',1,'Expiry alert sent for 7 contracts to Fizanaazz321@gmail.com.','sent','2026-09-06 11:33:19','2026-09-06 11:33:19','2026-09-06 11:33:19'),
(51,'pending_cheques',1,'Pending cheques alert sent for 2 cheques to Fizanaazz321@gmail.com.','sent','2026-09-06 11:33:20','2026-09-06 11:33:20','2026-09-06 11:33:20'),
(52,'vacant_properties',1,'Vacant properties alert sent for 11 units to Fizanaazz321@gmail.com.','sent','2026-09-06 11:33:23','2026-09-06 11:33:23','2026-09-06 11:33:23'),
(53,'monthly_dues',1,'Monthly dues alert sent for 16 contracts to Fizanaazz321@gmail.com.','sent','2026-09-06 11:33:24','2026-09-06 11:33:24','2026-09-06 11:33:24'),
(54,'monthly_dues',1,'Contract GFH-00028: 1-Month Rent & DEWA payment complete! Total received AED 40,000.00 (Target AED 40,000.00).','sent','2026-09-07 05:05:27','2026-09-07 05:05:27','2026-09-07 05:05:27'),
(55,'monthly_dues',1,'Contract GFH-00028: 1-Month Rent & DEWA payment complete! Total received AED 47,300.00 (Target AED 40,000.00).','sent','2026-09-07 05:15:23','2026-09-07 05:15:23','2026-09-07 05:15:23'),
(56,'contract_expiry',1,'Expiry alert sent for 8 contracts to Fizanaazz321@gmail.com.','sent','2026-09-10 05:25:07','2026-09-10 05:25:07','2026-09-10 05:25:07'),
(57,'pending_cheques',1,'Pending cheques alert sent for 6 cheques to Fizanaazz321@gmail.com.','sent','2026-09-10 05:25:09','2026-09-10 05:25:09','2026-09-10 05:25:09'),
(58,'vacant_properties',1,'Vacant properties alert sent for 13 units to Fizanaazz321@gmail.com.','sent','2026-09-10 05:25:10','2026-09-10 05:25:10','2026-09-10 05:25:10'),
(59,'monthly_dues',1,'Monthly dues alert sent for 17 contracts to Fizanaazz321@gmail.com.','sent','2026-09-10 05:25:11','2026-09-10 05:25:11','2026-09-10 05:25:11');
/*!40000 ALTER TABLE `notifications_log` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `owner_staff`
--

DROP TABLE IF EXISTS `owner_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner_staff` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `owner_staff_user_id_unique` (`user_id`),
  KEY `owner_staff_owner_id_foreign` (`owner_id`),
  KEY `owner_staff_created_by_foreign` (`created_by`),
  CONSTRAINT `owner_staff_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `owner_staff_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`),
  CONSTRAINT `owner_staff_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner_staff`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `owner_staff` WRITE;
/*!40000 ALTER TABLE `owner_staff` DISABLE KEYS */;
INSERT INTO `owner_staff` VALUES
(1,2,1,3,'2026-09-12 06:12:46','2026-09-12 06:12:46'),
(2,21,1,3,'2026-09-16 02:03:54','2026-09-16 02:03:54'),
(3,22,1,3,'2026-09-16 07:12:27','2026-09-16 07:12:27'),
(4,23,2,4,'2026-09-16 08:53:39','2026-09-16 08:53:39'),
(5,24,1,3,'2026-09-16 08:32:03','2026-09-16 08:32:03'),
(6,25,1,3,'2026-09-16 11:06:37','2026-09-16 11:06:37');
/*!40000 ALTER TABLE `owner_staff` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `owners_user_unique` (`user_id`),
  CONSTRAINT `owners_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES
(1,3,'Owner One Profile','0501111111','owner1@gofreehold.com',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,4,'Owner Two Profile','0502222222','owner2@gofreehold.com',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(3,8,'Owner User',NULL,'owner@gofreehold.com',NULL,'2026-08-16 14:34:28','2026-08-16 14:34:28'),
(4,10,'Mohammed Al Rashidi','+971501234001','m.rashidi@gfh.com','Downtown Dubai','2026-08-17 07:54:11','2026-08-17 07:54:11'),
(5,11,'Khalid Ibrahim Saeed','+971501234002','k.saeed@gfh.com','Business Bay, Dubai','2026-08-17 07:54:13','2026-08-17 07:54:13'),
(6,12,'Priya Nair Menon','+971501234003','p.menon@gfh.com','Dubai Marina','2026-08-17 07:54:14','2026-08-17 07:54:14'),
(7,13,'David James Carter','+971501234004','d.carter@gfh.com','Palm Jumeirah','2026-08-17 07:54:15','2026-08-17 07:54:15'),
(8,NULL,'Secondary Investor Profile',NULL,'second.owner@gofreehold.ae',NULL,'2026-08-21 23:04:47','2026-08-21 23:04:47'),
(9,20,'Fiza Nazz',NULL,'Owner10@gofreehold.com',NULL,'2026-09-11 13:21:49','2026-09-11 13:21:49'),
(10,NULL,'Paul Client Test',NULL,'paul_test_1789725766@testdomain.com',NULL,'2026-09-18 05:02:47','2026-09-18 05:02:47'),
(11,28,'abu bakar',NULL,'abub96891@gmail.com',NULL,'2026-09-18 05:46:03','2026-09-18 05:46:03'),
(12,29,'Ayesha',NULL,'ayesha908@gmail.com',NULL,'2026-09-18 06:06:20','2026-09-18 06:06:20');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payment_audit_logs`
--

DROP TABLE IF EXISTS `payment_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ledger_id` bigint(20) unsigned DEFAULT NULL,
  `payment_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `reason` text NOT NULL,
  `performed_by` bigint(20) unsigned DEFAULT NULL,
  `snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`snapshot`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_audit_logs_performed_by_foreign` (`performed_by`),
  KEY `payment_audit_logs_ledger_id_foreign` (`ledger_id`),
  CONSTRAINT `payment_audit_logs_ledger_id_foreign` FOREIGN KEY (`ledger_id`) REFERENCES `rent_transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_audit_logs_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_audit_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payment_audit_logs` WRITE;
/*!40000 ALTER TABLE `payment_audit_logs` DISABLE KEYS */;
INSERT INTO `payment_audit_logs` VALUES
(1,NULL,246,'deleted','Client duplicated transaction entry error',1,'{\"id\":246,\"contract_id\":2,\"tenant_id\":2,\"type\":\"other\",\"mode\":\"cash\",\"amount\":\"300.00\",\"date\":\"2026-08-18T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"Temporary duplicate payment to be deleted\",\"recorded_by\":null,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-08-18T07:56:41.000000Z\",\"updated_at\":\"2026-08-18T07:56:41.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[]}','2026-08-18 02:56:41','2026-08-18 02:56:41'),
(2,99,262,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":99,\"contract_id\":28,\"payment_id\":262,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"20000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T09:46:16.000000Z\",\"updated_at\":\"2026-09-07T09:46:16.000000Z\"}','2026-09-07 04:55:25','2026-09-07 04:55:25'),
(3,99,262,'deleted','Cancelled by administrator',1,'{\"id\":262,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"20000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":null,\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T09:46:16.000000Z\",\"updated_at\":\"2026-09-07T09:46:16.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[99]}','2026-09-07 04:55:25','2026-09-07 04:55:25'),
(4,95,258,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":95,\"contract_id\":28,\"payment_id\":258,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"40000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T08:29:39.000000Z\",\"updated_at\":\"2026-09-07T08:29:39.000000Z\"}','2026-09-07 04:58:49','2026-09-07 04:58:49'),
(5,95,258,'deleted','Cancelled by administrator',1,'{\"id\":258,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"40000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"nothing\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T08:29:39.000000Z\",\"updated_at\":\"2026-09-07T08:29:39.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[95]}','2026-09-07 04:58:49','2026-09-07 04:58:49'),
(6,96,259,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":96,\"contract_id\":28,\"payment_id\":259,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"50000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T08:30:38.000000Z\",\"updated_at\":\"2026-09-07T08:30:38.000000Z\"}','2026-09-07 04:59:02','2026-09-07 04:59:02'),
(7,96,259,'deleted','Cancelled by administrator',1,'{\"id\":259,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"50000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"nothing\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T08:30:38.000000Z\",\"updated_at\":\"2026-09-07T08:30:38.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[96]}','2026-09-07 04:59:02','2026-09-07 04:59:02'),
(8,NULL,4,'deleted','Cancelled by administrator',1,'{\"id\":4,\"contract_id\":1,\"tenant_id\":1,\"type\":\"deposit\",\"mode\":\"cheque\",\"amount\":\"4166.67\",\"date\":\"2026-02-10T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"Security Deposit received\",\"recorded_by\":null,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-08-17T08:12:23.000000Z\",\"updated_at\":\"2026-08-17T08:12:23.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[]}','2026-09-07 04:59:09','2026-09-07 04:59:09'),
(9,NULL,1,'deleted','Cancelled by administrator',1,'{\"id\":1,\"contract_id\":1,\"tenant_id\":1,\"type\":\"rent\",\"mode\":\"bank_transfer\",\"amount\":\"20000.00\",\"date\":\"2026-08-10T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"Seed payment\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-08-10T09:22:38.000000Z\",\"updated_at\":\"2026-08-10T09:22:38.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[]}','2026-09-07 04:59:14','2026-09-07 04:59:14'),
(10,100,263,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":100,\"contract_id\":28,\"payment_id\":263,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"40000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:05:27.000000Z\",\"updated_at\":\"2026-09-07T10:05:27.000000Z\"}','2026-09-07 05:05:51','2026-09-07 05:05:51'),
(11,100,263,'deleted','Cancelled by administrator',1,'{\"id\":263,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"40000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"Test monthly payment\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:05:27.000000Z\",\"updated_at\":\"2026-09-07T10:05:27.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[100]}','2026-09-07 05:05:52','2026-09-07 05:05:52'),
(12,102,265,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":102,\"contract_id\":28,\"payment_id\":265,\"date\":\"2026-08-28T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"2300.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:13:26.000000Z\",\"updated_at\":\"2026-09-07T10:13:26.000000Z\"}','2026-09-07 05:13:42','2026-09-07 05:13:42'),
(13,102,265,'deleted','Cancelled by administrator',1,'{\"id\":265,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"bank_transfer\",\"amount\":\"2300.00\",\"date\":\"2026-08-28T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"City bank transfer\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:13:26.000000Z\",\"updated_at\":\"2026-09-07T10:13:26.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[102]}','2026-09-07 05:13:42','2026-09-07 05:13:42'),
(14,101,264,'deleted','Deleted by administrator (linked ledger credit reversed with payment)',1,'{\"id\":101,\"contract_id\":28,\"payment_id\":264,\"date\":\"2026-07-25T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"2300.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:13:26.000000Z\",\"updated_at\":\"2026-09-07T10:13:26.000000Z\"}','2026-09-07 05:23:47','2026-09-07 05:23:47'),
(15,101,264,'deleted','Deleted by administrator',1,'{\"id\":264,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"2300.00\",\"date\":\"2026-07-25T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"July Rent\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:13:26.000000Z\",\"updated_at\":\"2026-09-07T10:13:26.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[101]}','2026-09-07 05:23:47','2026-09-07 05:23:47'),
(16,106,269,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":106,\"contract_id\":24,\"payment_id\":269,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"20000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:21:40.000000Z\",\"updated_at\":\"2026-09-07T10:21:40.000000Z\"}','2026-09-07 05:25:14','2026-09-07 05:25:14'),
(17,106,269,'deleted','Cancelled by administrator',1,'{\"id\":269,\"contract_id\":24,\"tenant_id\":1,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"20000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":null,\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:21:40.000000Z\",\"updated_at\":\"2026-09-07T10:21:40.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[106]}','2026-09-07 05:25:14','2026-09-07 05:25:14'),
(18,107,270,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":107,\"contract_id\":24,\"payment_id\":270,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"DEWA payment\",\"debit\":\"0.00\",\"credit\":\"1000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:26:00.000000Z\",\"updated_at\":\"2026-09-07T10:26:00.000000Z\"}','2026-09-07 05:26:04','2026-09-07 05:26:04'),
(19,107,270,'deleted','Cancelled by administrator',1,'{\"id\":270,\"contract_id\":24,\"tenant_id\":1,\"type\":\"dewa\",\"mode\":\"cash\",\"amount\":\"1000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":null,\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:26:00.000000Z\",\"updated_at\":\"2026-09-07T10:26:00.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[107]}','2026-09-07 05:26:04','2026-09-07 05:26:04'),
(20,105,268,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":105,\"contract_id\":28,\"payment_id\":268,\"date\":\"2026-09-07T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"40000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:15:23.000000Z\",\"updated_at\":\"2026-09-07T10:15:23.000000Z\"}','2026-09-07 05:29:01','2026-09-07 05:29:01'),
(21,105,268,'deleted','Cancelled by administrator',1,'{\"id\":268,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"cash\",\"amount\":\"40000.00\",\"date\":\"2026-09-07T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"nothing\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:15:23.000000Z\",\"updated_at\":\"2026-09-07T10:15:23.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[105]}','2026-09-07 05:29:01','2026-09-07 05:29:01'),
(22,103,266,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":103,\"contract_id\":28,\"payment_id\":266,\"date\":\"2026-09-27T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"2500.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:14:00.000000Z\",\"updated_at\":\"2026-09-07T10:14:00.000000Z\"}','2026-09-07 05:29:04','2026-09-07 05:29:04'),
(23,103,266,'deleted','Cancelled by administrator',1,'{\"id\":266,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"bank_transfer\",\"amount\":\"2500.00\",\"date\":\"2026-09-27T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"adcb\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:14:00.000000Z\",\"updated_at\":\"2026-09-07T10:14:00.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[103]}','2026-09-07 05:29:04','2026-09-07 05:29:04'),
(24,104,267,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":104,\"contract_id\":28,\"payment_id\":267,\"date\":\"2026-10-25T00:00:00.000000Z\",\"description\":\"RENT payment\",\"debit\":\"0.00\",\"credit\":\"2500.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-07T10:14:00.000000Z\",\"updated_at\":\"2026-09-07T10:14:00.000000Z\"}','2026-09-07 05:29:07','2026-09-07 05:29:07'),
(25,104,267,'deleted','Cancelled by administrator',1,'{\"id\":267,\"contract_id\":28,\"tenant_id\":4,\"type\":\"rent\",\"mode\":\"bank_transfer\",\"amount\":\"2500.00\",\"date\":\"2026-10-25T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"adcb\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-07T10:14:00.000000Z\",\"updated_at\":\"2026-09-07T10:14:00.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[104]}','2026-09-07 05:29:07','2026-09-07 05:29:07'),
(26,48,254,'deleted','Cancelled by administrator (linked ledger credit reversed with payment)',1,'{\"id\":48,\"contract_id\":26,\"payment_id\":254,\"date\":\"2026-09-03T00:00:00.000000Z\",\"description\":\"RENT payment ref TXN-152808\",\"debit\":\"0.00\",\"credit\":\"25000.00\",\"deleted_by\":null,\"deletion_reason\":null,\"deleted_at\":null,\"created_at\":\"2026-09-03T10:28:09.000000Z\",\"updated_at\":\"2026-09-03T10:28:09.000000Z\"}','2026-09-11 11:55:44','2026-09-11 11:55:44'),
(27,48,254,'deleted','Cancelled by administrator',1,'{\"id\":254,\"contract_id\":26,\"tenant_id\":10,\"type\":\"rent\",\"mode\":\"bank_transfer\",\"amount\":\"25000.00\",\"date\":\"2026-09-03T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":\"TXN-152808\",\"remarks\":\"Q3 Rent instalment received via Emirates NBD\",\"recorded_by\":1,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-09-03T10:28:08.000000Z\",\"updated_at\":\"2026-09-03T10:28:08.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[48]}','2026-09-11 11:55:44','2026-09-11 11:55:44');
/*!40000 ALTER TABLE `payment_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `tenant_id` bigint(20) unsigned DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `mode` varchar(255) NOT NULL DEFAULT 'cash',
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `receipt_number` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `deleted_by` bigint(20) unsigned DEFAULT NULL,
  `deletion_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_contract_id_foreign` (`contract_id`),
  KEY `payments_tenant_id_foreign` (`tenant_id`),
  KEY `payments_recorded_by_foreign` (`recorded_by`),
  CONSTRAINT `payments_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=276 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES
(1,1,1,'rent','bank_transfer',20000.00,'2026-08-10',NULL,NULL,NULL,'Seed payment',1,1,'Cancelled by administrator','2026-08-10 04:22:38','2026-09-07 04:59:14','2026-09-07 04:59:14'),
(2,2,2,'rent','cash',6666.67,'2026-08-17',NULL,NULL,NULL,'[AUTO-TEST] Monthly Rent Aug',NULL,NULL,NULL,'2026-08-17 03:02:21','2026-08-17 03:02:21',NULL),
(3,2,2,'dewa','bank_transfer',450.00,'2026-08-17',NULL,NULL,NULL,'[AUTO-TEST] DEWA Aug',NULL,NULL,NULL,'2026-08-17 03:02:21','2026-08-17 03:02:21',NULL),
(4,1,1,'deposit','cheque',4166.67,'2026-02-10',NULL,NULL,NULL,'Security Deposit received',NULL,1,'Cancelled by administrator','2026-08-17 03:12:23','2026-09-07 04:59:10','2026-09-07 04:59:10'),
(5,1,1,'rent','bank_transfer',4166.67,'2026-02-10',NULL,NULL,NULL,'Month 1 Rent',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(6,1,1,'rent','bank_transfer',4166.67,'2026-03-10',NULL,NULL,NULL,'Month 2 Rent',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(7,1,1,'dewa','cash',380.00,'2026-02-10',NULL,NULL,NULL,'DEWA - Month 1',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(8,1,1,'dewa','cash',420.50,'2026-03-10',NULL,NULL,NULL,'DEWA - Month 2',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(9,2,2,'deposit','cheque',6666.67,'2025-09-10',NULL,NULL,NULL,'Security Deposit',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(10,2,2,'rent','bank_transfer',6666.67,'2025-09-10',NULL,NULL,NULL,'Monthly Rent - Sep 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(11,2,2,'rent','cheque',6666.67,'2025-10-10',NULL,NULL,NULL,'Monthly Rent - Oct 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(12,2,2,'rent','bank_transfer',6666.67,'2025-11-10',NULL,NULL,NULL,'Monthly Rent - Nov 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(13,2,2,'rent','cheque',6666.67,'2025-12-10',NULL,NULL,NULL,'Monthly Rent - Dec 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(14,2,2,'rent','bank_transfer',6666.67,'2026-01-10',NULL,NULL,NULL,'Monthly Rent - Jan 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(15,2,2,'rent','cheque',6666.67,'2026-02-10',NULL,NULL,NULL,'Monthly Rent - Feb 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(16,2,2,'rent','bank_transfer',6666.67,'2026-03-10',NULL,NULL,NULL,'Monthly Rent - Mar 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(17,2,2,'rent','cheque',6666.67,'2026-04-10',NULL,NULL,NULL,'Monthly Rent - Apr 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(18,2,2,'rent','bank_transfer',6666.67,'2026-05-10',NULL,NULL,NULL,'Monthly Rent - May 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(19,2,2,'rent','cheque',6666.67,'2026-06-10',NULL,NULL,NULL,'Monthly Rent - Jun 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(20,2,2,'rent','bank_transfer',6666.67,'2026-07-10',NULL,NULL,NULL,'Monthly Rent - Jul 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(21,2,2,'rent','cheque',6666.67,'2026-08-10',NULL,NULL,NULL,'Monthly Rent - Aug 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(22,2,2,'dewa','cash',392.46,'2025-09-10',NULL,NULL,NULL,'DEWA Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(23,2,2,'dewa','cash',520.24,'2025-10-10',NULL,NULL,NULL,'DEWA Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(24,2,2,'dewa','cash',616.51,'2025-11-10',NULL,NULL,NULL,'DEWA Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(25,2,2,'dewa','cash',402.22,'2025-12-10',NULL,NULL,NULL,'DEWA Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(26,2,2,'dewa','cash',378.24,'2026-01-10',NULL,NULL,NULL,'DEWA Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(27,2,2,'dewa','cash',615.92,'2026-02-10',NULL,NULL,NULL,'DEWA Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(28,2,2,'service_charge','bank_transfer',333.33,'2025-09-10',NULL,NULL,NULL,'Annual Service Charge (5%)',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(29,3,3,'deposit','cheque',10000.00,'2025-08-10',NULL,NULL,NULL,'Security Deposit received',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(30,3,3,'rent','bank_transfer',10000.00,'2025-08-10',NULL,NULL,NULL,'Month 1 Rent',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(31,3,3,'rent','bank_transfer',10000.00,'2025-09-10',NULL,NULL,NULL,'Month 2 Rent',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(32,3,3,'dewa','cash',380.00,'2025-08-10',NULL,NULL,NULL,'DEWA - Month 1',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(33,3,3,'dewa','cash',420.50,'2025-09-10',NULL,NULL,NULL,'DEWA - Month 2',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(34,4,2,'deposit','cheque',10833.33,'2025-03-15',NULL,NULL,NULL,'Security Deposit',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(35,4,2,'rent','bank_transfer',10833.33,'2025-03-15',NULL,NULL,NULL,'Monthly Rent - Mar 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(36,4,2,'rent','cheque',10833.33,'2025-04-15',NULL,NULL,NULL,'Monthly Rent - Apr 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(37,4,2,'rent','bank_transfer',10833.33,'2025-05-15',NULL,NULL,NULL,'Monthly Rent - May 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(38,4,2,'rent','cheque',10833.33,'2025-06-15',NULL,NULL,NULL,'Monthly Rent - Jun 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(39,4,2,'rent','bank_transfer',10833.33,'2025-07-15',NULL,NULL,NULL,'Monthly Rent - Jul 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(40,4,2,'rent','cheque',10833.33,'2025-08-15',NULL,NULL,NULL,'Monthly Rent - Aug 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(41,4,2,'rent','bank_transfer',10833.33,'2025-09-15',NULL,NULL,NULL,'Monthly Rent - Sep 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(42,4,2,'rent','cheque',10833.33,'2025-10-15',NULL,NULL,NULL,'Monthly Rent - Oct 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(43,4,2,'rent','bank_transfer',10833.33,'2025-11-15',NULL,NULL,NULL,'Monthly Rent - Nov 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(44,4,2,'rent','cheque',10833.33,'2025-12-15',NULL,NULL,NULL,'Monthly Rent - Dec 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(45,4,2,'rent','bank_transfer',10833.33,'2026-01-15',NULL,NULL,NULL,'Monthly Rent - Jan 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(46,4,2,'rent','cheque',10833.33,'2026-02-15',NULL,NULL,NULL,'Monthly Rent - Feb 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(47,4,2,'dewa','cash',623.42,'2025-03-15',NULL,NULL,NULL,'DEWA Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(48,4,2,'dewa','cash',503.65,'2025-04-15',NULL,NULL,NULL,'DEWA Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(49,4,2,'dewa','cash',545.46,'2025-05-15',NULL,NULL,NULL,'DEWA Bill - May 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(50,4,2,'dewa','cash',356.20,'2025-06-15',NULL,NULL,NULL,'DEWA Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(51,4,2,'dewa','cash',422.89,'2025-07-15',NULL,NULL,NULL,'DEWA Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(52,4,2,'dewa','cash',567.67,'2025-08-15',NULL,NULL,NULL,'DEWA Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(53,4,2,'service_charge','bank_transfer',541.67,'2025-03-15',NULL,NULL,NULL,'Annual Service Charge (5%)',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(54,1,1,'rent','cash',4166.67,'2026-02-10',NULL,NULL,NULL,'Rent installment - Month 1 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL),
(55,1,1,'rent','bank_transfer',4166.67,'2026-03-10',NULL,NULL,NULL,'Rent installment - Month 2 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL),
(56,1,1,'rent','cash',4166.67,'2026-04-10',NULL,NULL,NULL,'Rent installment - Month 3 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL),
(57,1,1,'rent','bank_transfer',4166.67,'2026-05-10',NULL,NULL,NULL,'Rent installment - Month 4 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(58,1,1,'rent','cash',4166.67,'2026-06-10',NULL,NULL,NULL,'Rent installment - Month 5 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(59,1,1,'rent','bank_transfer',4166.67,'2026-07-10',NULL,NULL,NULL,'Rent installment - Month 6 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(60,1,1,'rent','cash',4166.67,'2026-08-10',NULL,NULL,NULL,'Rent installment - Month 7 (Aug 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(61,1,1,'rent','bank_transfer',4166.67,'2026-09-10',NULL,NULL,NULL,'Rent installment - Month 8 (Sep 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(62,1,1,'rent','cash',4166.67,'2026-10-10',NULL,NULL,NULL,'Rent installment - Month 9 (Oct 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(63,1,1,'rent','bank_transfer',4166.67,'2026-11-10',NULL,NULL,NULL,'Rent installment - Month 10 (Nov 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(64,1,1,'rent','cash',4166.67,'2026-12-10',NULL,NULL,NULL,'Rent installment - Month 11 (Dec 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(65,1,1,'rent','bank_transfer',4166.67,'2027-01-10',NULL,NULL,NULL,'Rent installment - Month 12 (Jan 2027)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(66,1,1,'dewa','bank_transfer',451.76,'2026-02-10',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(67,1,1,'dewa','bank_transfer',548.32,'2026-03-10',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(68,1,1,'dewa','bank_transfer',437.38,'2026-04-10',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(69,1,1,'dewa','bank_transfer',398.39,'2026-05-10',NULL,NULL,NULL,'DEWA Utility Bill - May 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(70,1,1,'dewa','bank_transfer',590.80,'2026-06-10',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(71,1,1,'dewa','bank_transfer',447.71,'2026-07-10',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(72,2,2,'rent','cash',6666.67,'2025-09-10',NULL,NULL,NULL,'Rent installment - Month 1 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(73,2,2,'rent','bank_transfer',6666.67,'2025-10-10',NULL,NULL,NULL,'Rent installment - Month 2 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(74,2,2,'rent','cash',6666.67,'2025-11-10',NULL,NULL,NULL,'Rent installment - Month 3 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(75,2,2,'rent','bank_transfer',6666.67,'2025-12-10',NULL,NULL,NULL,'Rent installment - Month 4 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(76,2,2,'rent','cash',6666.67,'2026-01-10',NULL,NULL,NULL,'Rent installment - Month 5 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(77,2,2,'rent','bank_transfer',6666.67,'2026-02-10',NULL,NULL,NULL,'Rent installment - Month 6 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(78,2,2,'rent','cash',6666.67,'2026-03-10',NULL,NULL,NULL,'Rent installment - Month 7 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(79,2,2,'rent','bank_transfer',6666.67,'2026-04-10',NULL,NULL,NULL,'Rent installment - Month 8 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(80,2,2,'rent','cash',6666.67,'2026-05-10',NULL,NULL,NULL,'Rent installment - Month 9 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(81,2,2,'rent','bank_transfer',6666.67,'2026-06-10',NULL,NULL,NULL,'Rent installment - Month 10 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(82,2,2,'rent','cash',6666.67,'2026-07-10',NULL,NULL,NULL,'Rent installment - Month 11 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(83,2,2,'rent','bank_transfer',6666.67,'2026-08-10',NULL,NULL,NULL,'Rent installment - Month 12 (Aug 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(84,2,2,'dewa','bank_transfer',547.63,'2025-09-10',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(85,2,2,'dewa','bank_transfer',494.66,'2025-10-10',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(86,2,2,'dewa','bank_transfer',416.26,'2025-11-10',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(87,2,2,'dewa','bank_transfer',602.05,'2025-12-10',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(88,2,2,'dewa','bank_transfer',605.21,'2026-01-10',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(89,2,2,'dewa','bank_transfer',588.23,'2026-02-10',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(90,3,3,'rent','cash',10000.00,'2025-08-10',NULL,NULL,NULL,'Rent installment - Month 1 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(91,3,3,'rent','bank_transfer',10000.00,'2025-09-10',NULL,NULL,NULL,'Rent installment - Month 2 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(92,3,3,'rent','cash',10000.00,'2025-10-10',NULL,NULL,NULL,'Rent installment - Month 3 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(93,3,3,'rent','bank_transfer',10000.00,'2025-11-10',NULL,NULL,NULL,'Rent installment - Month 4 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(94,3,3,'rent','cash',10000.00,'2025-12-10',NULL,NULL,NULL,'Rent installment - Month 5 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(95,3,3,'rent','bank_transfer',10000.00,'2026-01-10',NULL,NULL,NULL,'Rent installment - Month 6 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(96,3,3,'rent','cash',10000.00,'2026-02-10',NULL,NULL,NULL,'Rent installment - Month 7 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(97,3,3,'rent','bank_transfer',10000.00,'2026-03-10',NULL,NULL,NULL,'Rent installment - Month 8 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(98,3,3,'rent','cash',10000.00,'2026-04-10',NULL,NULL,NULL,'Rent installment - Month 9 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(99,3,3,'rent','bank_transfer',10000.00,'2026-05-10',NULL,NULL,NULL,'Rent installment - Month 10 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(100,3,3,'rent','cash',10000.00,'2026-06-10',NULL,NULL,NULL,'Rent installment - Month 11 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(101,3,3,'rent','bank_transfer',10000.00,'2026-07-10',NULL,NULL,NULL,'Rent installment - Month 12 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(102,3,3,'dewa','bank_transfer',645.23,'2025-08-10',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(103,3,3,'dewa','bank_transfer',432.70,'2025-09-10',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(104,3,3,'dewa','bank_transfer',617.08,'2025-10-10',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(105,3,3,'dewa','bank_transfer',423.06,'2025-11-10',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(106,3,3,'dewa','bank_transfer',470.58,'2025-12-10',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(107,3,3,'dewa','bank_transfer',631.20,'2026-01-10',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(108,4,2,'rent','cash',10833.33,'2025-03-15',NULL,NULL,NULL,'Rent installment - Month 1 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(109,4,2,'rent','bank_transfer',10833.33,'2025-04-15',NULL,NULL,NULL,'Rent installment - Month 2 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(110,4,2,'rent','cash',10833.33,'2025-05-15',NULL,NULL,NULL,'Rent installment - Month 3 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(111,4,2,'rent','bank_transfer',10833.33,'2025-06-15',NULL,NULL,NULL,'Rent installment - Month 4 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(112,4,2,'rent','cash',10833.33,'2025-07-15',NULL,NULL,NULL,'Rent installment - Month 5 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(113,4,2,'rent','bank_transfer',10833.33,'2025-08-15',NULL,NULL,NULL,'Rent installment - Month 6 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(114,4,2,'rent','cash',10833.33,'2025-09-15',NULL,NULL,NULL,'Rent installment - Month 7 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(115,4,2,'rent','bank_transfer',10833.33,'2025-10-15',NULL,NULL,NULL,'Rent installment - Month 8 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(116,4,2,'rent','cash',10833.33,'2025-11-15',NULL,NULL,NULL,'Rent installment - Month 9 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(117,4,2,'rent','bank_transfer',10833.33,'2025-12-15',NULL,NULL,NULL,'Rent installment - Month 10 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(118,4,2,'rent','cash',10833.33,'2026-01-15',NULL,NULL,NULL,'Rent installment - Month 11 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(119,4,2,'rent','bank_transfer',10833.33,'2026-02-15',NULL,NULL,NULL,'Rent installment - Month 12 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(120,4,2,'dewa','bank_transfer',403.28,'2025-03-15',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(121,4,2,'dewa','bank_transfer',458.28,'2025-04-15',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(122,4,2,'dewa','bank_transfer',396.98,'2025-05-15',NULL,NULL,NULL,'DEWA Utility Bill - May 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(123,4,2,'dewa','bank_transfer',574.22,'2025-06-15',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(124,4,2,'dewa','bank_transfer',437.34,'2025-07-15',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(125,4,2,'dewa','bank_transfer',463.06,'2025-08-15',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(126,5,5,'deposit','cheque',7083.33,'2025-01-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(127,5,5,'rent','cash',7083.33,'2025-01-01',NULL,NULL,NULL,'Rent installment - Month 1 (Jan 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(128,5,5,'rent','bank_transfer',7083.33,'2025-02-01',NULL,NULL,NULL,'Rent installment - Month 2 (Feb 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(129,5,5,'rent','cash',7083.33,'2025-03-01',NULL,NULL,NULL,'Rent installment - Month 3 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(130,5,5,'rent','bank_transfer',7083.33,'2025-04-01',NULL,NULL,NULL,'Rent installment - Month 4 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(131,5,5,'rent','cash',7083.33,'2025-05-01',NULL,NULL,NULL,'Rent installment - Month 5 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(132,5,5,'rent','bank_transfer',7083.33,'2025-06-01',NULL,NULL,NULL,'Rent installment - Month 6 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(133,5,5,'rent','cash',7083.33,'2025-07-01',NULL,NULL,NULL,'Rent installment - Month 7 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(134,5,5,'rent','bank_transfer',7083.33,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 8 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(135,5,5,'rent','cash',7083.33,'2025-09-01',NULL,NULL,NULL,'Rent installment - Month 9 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(136,5,5,'rent','bank_transfer',7083.33,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 10 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(137,5,5,'rent','cash',7083.33,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 11 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(138,5,5,'rent','bank_transfer',7083.33,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 12 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(139,5,5,'dewa','bank_transfer',539.05,'2025-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(140,5,5,'dewa','bank_transfer',592.43,'2025-02-01',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(141,5,5,'dewa','bank_transfer',432.53,'2025-03-01',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(142,5,5,'dewa','bank_transfer',482.79,'2025-04-01',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(143,5,5,'dewa','bank_transfer',384.36,'2025-05-01',NULL,NULL,NULL,'DEWA Utility Bill - May 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(144,5,5,'dewa','bank_transfer',597.80,'2025-06-01',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(145,6,6,'deposit','cheque',10833.33,'2025-03-15',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(146,6,6,'rent','cash',10833.33,'2025-03-15',NULL,NULL,NULL,'Rent installment - Month 1 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(147,6,6,'rent','bank_transfer',10833.33,'2025-04-15',NULL,NULL,NULL,'Rent installment - Month 2 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(148,6,6,'rent','cash',10833.33,'2025-05-15',NULL,NULL,NULL,'Rent installment - Month 3 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(149,6,6,'rent','bank_transfer',10833.33,'2025-06-15',NULL,NULL,NULL,'Rent installment - Month 4 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(150,6,6,'rent','cash',10833.33,'2025-07-15',NULL,NULL,NULL,'Rent installment - Month 5 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(151,6,6,'rent','bank_transfer',10833.33,'2025-08-15',NULL,NULL,NULL,'Rent installment - Month 6 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(152,6,6,'rent','cash',10833.33,'2025-09-15',NULL,NULL,NULL,'Rent installment - Month 7 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(153,6,6,'rent','bank_transfer',10833.33,'2025-10-15',NULL,NULL,NULL,'Rent installment - Month 8 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(154,6,6,'rent','cash',10833.33,'2025-11-15',NULL,NULL,NULL,'Rent installment - Month 9 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(155,6,6,'rent','bank_transfer',10833.33,'2025-12-15',NULL,NULL,NULL,'Rent installment - Month 10 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(156,6,6,'rent','cash',10833.33,'2026-01-15',NULL,NULL,NULL,'Rent installment - Month 11 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(157,6,6,'rent','bank_transfer',10833.33,'2026-02-15',NULL,NULL,NULL,'Rent installment - Month 12 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(158,6,6,'dewa','bank_transfer',471.95,'2025-03-15',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(159,6,6,'dewa','bank_transfer',381.10,'2025-04-15',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(160,6,6,'dewa','bank_transfer',600.70,'2025-05-15',NULL,NULL,NULL,'DEWA Utility Bill - May 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(161,6,6,'dewa','bank_transfer',503.78,'2025-06-15',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(162,6,6,'dewa','bank_transfer',410.84,'2025-07-15',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(163,6,6,'dewa','bank_transfer',420.21,'2025-08-15',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(164,7,7,'deposit','cheque',18333.33,'2025-06-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(165,7,7,'rent','cash',18333.33,'2025-06-01',NULL,NULL,NULL,'Rent installment - Month 1 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(166,7,7,'rent','bank_transfer',18333.33,'2025-07-01',NULL,NULL,NULL,'Rent installment - Month 2 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(167,7,7,'rent','cash',18333.33,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 3 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(168,7,7,'rent','bank_transfer',18333.33,'2025-09-01',NULL,NULL,NULL,'Rent installment - Month 4 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(169,7,7,'rent','cash',18333.33,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 5 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(170,7,7,'rent','bank_transfer',18333.33,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 6 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(171,7,7,'rent','cash',18333.33,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 7 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(172,7,7,'rent','bank_transfer',18333.33,'2026-01-01',NULL,NULL,NULL,'Rent installment - Month 8 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(173,7,7,'rent','cash',18333.33,'2026-02-01',NULL,NULL,NULL,'Rent installment - Month 9 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(174,7,7,'rent','bank_transfer',18333.33,'2026-03-01',NULL,NULL,NULL,'Rent installment - Month 10 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(175,7,7,'rent','cash',18333.33,'2026-04-01',NULL,NULL,NULL,'Rent installment - Month 11 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(176,7,7,'rent','bank_transfer',18333.33,'2026-05-01',NULL,NULL,NULL,'Rent installment - Month 12 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(177,7,7,'dewa','bank_transfer',634.70,'2025-06-01',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(178,7,7,'dewa','bank_transfer',397.86,'2025-07-01',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(179,7,7,'dewa','bank_transfer',639.87,'2025-08-01',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(180,7,7,'dewa','bank_transfer',492.56,'2025-09-01',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(181,7,7,'dewa','bank_transfer',648.81,'2025-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(182,7,7,'dewa','bank_transfer',539.44,'2025-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(183,8,8,'deposit','cheque',7916.67,'2024-09-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(184,8,8,'rent','cash',7916.67,'2024-09-01',NULL,NULL,NULL,'Rent installment - Month 1 (Sep 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(185,8,8,'rent','bank_transfer',7916.67,'2024-10-01',NULL,NULL,NULL,'Rent installment - Month 2 (Oct 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(186,8,8,'rent','cash',7916.67,'2024-11-01',NULL,NULL,NULL,'Rent installment - Month 3 (Nov 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(187,8,8,'rent','bank_transfer',7916.67,'2024-12-01',NULL,NULL,NULL,'Rent installment - Month 4 (Dec 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(188,8,8,'rent','cash',7916.67,'2025-01-01',NULL,NULL,NULL,'Rent installment - Month 5 (Jan 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(189,8,8,'rent','bank_transfer',7916.67,'2025-02-01',NULL,NULL,NULL,'Rent installment - Month 6 (Feb 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(190,8,8,'rent','cash',7916.67,'2025-03-01',NULL,NULL,NULL,'Rent installment - Month 7 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(191,8,8,'rent','bank_transfer',7916.67,'2025-04-01',NULL,NULL,NULL,'Rent installment - Month 8 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(192,8,8,'rent','cash',7916.67,'2025-05-01',NULL,NULL,NULL,'Rent installment - Month 9 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(193,8,8,'rent','bank_transfer',7916.67,'2025-06-01',NULL,NULL,NULL,'Rent installment - Month 10 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(194,8,8,'rent','cash',7916.67,'2025-07-01',NULL,NULL,NULL,'Rent installment - Month 11 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(195,8,8,'rent','bank_transfer',7916.67,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 12 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(196,8,8,'dewa','bank_transfer',575.00,'2024-09-01',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(197,8,8,'dewa','bank_transfer',421.40,'2024-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(198,8,8,'dewa','bank_transfer',496.63,'2024-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(199,8,8,'dewa','bank_transfer',413.25,'2024-12-01',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(200,8,8,'dewa','bank_transfer',559.72,'2025-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(201,8,8,'dewa','bank_transfer',618.92,'2025-02-01',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(202,9,9,'deposit','cheque',11666.67,'2025-08-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(203,9,9,'rent','cash',11666.67,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 1 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(204,9,9,'rent','bank_transfer',11666.67,'2025-09-01',NULL,NULL,NULL,'Rent installment - Month 2 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(205,9,9,'rent','cash',11666.67,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 3 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(206,9,9,'rent','bank_transfer',11666.67,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 4 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(207,9,9,'rent','cash',11666.67,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 5 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(208,9,9,'rent','bank_transfer',11666.67,'2026-01-01',NULL,NULL,NULL,'Rent installment - Month 6 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(209,9,9,'rent','cash',11666.67,'2026-02-01',NULL,NULL,NULL,'Rent installment - Month 7 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(210,9,9,'rent','bank_transfer',11666.67,'2026-03-01',NULL,NULL,NULL,'Rent installment - Month 8 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(211,9,9,'rent','cash',11666.67,'2026-04-01',NULL,NULL,NULL,'Rent installment - Month 9 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(212,9,9,'rent','bank_transfer',11666.67,'2026-05-01',NULL,NULL,NULL,'Rent installment - Month 10 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(213,9,9,'rent','cash',11666.67,'2026-06-01',NULL,NULL,NULL,'Rent installment - Month 11 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(214,9,9,'rent','bank_transfer',11666.67,'2026-07-01',NULL,NULL,NULL,'Rent installment - Month 12 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(215,9,9,'dewa','bank_transfer',493.96,'2025-08-01',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(216,9,9,'dewa','bank_transfer',564.38,'2025-09-01',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(217,9,9,'dewa','bank_transfer',415.97,'2025-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(218,9,9,'dewa','bank_transfer',458.63,'2025-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(219,9,9,'dewa','bank_transfer',610.43,'2025-12-01',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(220,9,9,'dewa','bank_transfer',597.12,'2026-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(221,10,5,'deposit','cheque',4583.33,'2025-10-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(222,10,5,'rent','cash',4583.33,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 1 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(223,10,5,'rent','bank_transfer',4583.33,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 2 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(224,10,5,'rent','cash',4583.33,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 3 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(225,10,5,'rent','bank_transfer',4583.33,'2026-01-01',NULL,NULL,NULL,'Rent installment - Month 4 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(226,10,5,'rent','cash',4583.33,'2026-02-01',NULL,NULL,NULL,'Rent installment - Month 5 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(227,10,5,'rent','bank_transfer',4583.33,'2026-03-01',NULL,NULL,NULL,'Rent installment - Month 6 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(228,10,5,'rent','cash',4583.33,'2026-04-01',NULL,NULL,NULL,'Rent installment - Month 7 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(229,10,5,'rent','bank_transfer',4583.33,'2026-05-01',NULL,NULL,NULL,'Rent installment - Month 8 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(230,10,5,'rent','cash',4583.33,'2026-06-01',NULL,NULL,NULL,'Rent installment - Month 9 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(231,10,5,'rent','bank_transfer',4583.33,'2026-07-01',NULL,NULL,NULL,'Rent installment - Month 10 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(232,10,5,'rent','cash',4583.33,'2026-08-01',NULL,NULL,NULL,'Rent installment - Month 11 (Aug 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(233,10,5,'dewa','bank_transfer',531.10,'2025-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(234,10,5,'dewa','bank_transfer',403.36,'2025-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(235,10,5,'dewa','bank_transfer',636.37,'2025-12-01',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(236,10,5,'dewa','bank_transfer',490.16,'2026-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(237,10,5,'dewa','bank_transfer',489.56,'2026-02-01',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(238,10,5,'dewa','bank_transfer',473.86,'2026-03-01',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(239,2,2,'rent','cash',7500.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Monthly Rent Installment via Cash',1,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51',NULL),
(240,2,2,'dewa','bank_transfer',620.50,'2026-08-18',NULL,NULL,NULL,'Real-Test DEWA Electricity & Water Clearance',1,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51',NULL),
(241,2,2,'deposit','cheque',5000.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Refundable Security Deposit',1,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51',NULL),
(242,2,2,'rent','cash',7500.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Monthly Rent Installment via Cash',1,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(243,2,2,'dewa','bank_transfer',620.50,'2026-08-18',NULL,NULL,NULL,'Real-Test DEWA Electricity & Water Clearance',1,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(244,2,2,'deposit','cheque',5000.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Refundable Security Deposit',1,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(245,2,2,'rent','cheque',20000.00,'2026-08-18',NULL,NULL,NULL,'PDC Cheque Cleared (CHQ-165874 - Emirates NBD)',NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(246,2,2,'other','cash',300.00,'2026-08-18',NULL,NULL,NULL,'Temporary duplicate payment to be deleted',NULL,1,'Client duplicated transaction entry error','2026-08-18 02:56:41','2026-08-18 02:56:41','2026-08-18 02:56:41'),
(247,2,2,'dewa','cash',80000.00,'2026-08-21',NULL,NULL,NULL,'nothig',1,NULL,NULL,'2026-08-21 11:31:49','2026-08-21 11:31:49',NULL),
(248,11,1,'rent','Cash',5000.00,'2026-08-21',NULL,NULL,NULL,'Deep test payment - monthly rent',1,NULL,NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07',NULL),
(249,11,1,'rent','Cash',5000.00,'2026-08-21',NULL,NULL,NULL,'Deep test payment - monthly rent',1,NULL,NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58',NULL),
(250,11,1,'rent','Cash',5000.00,'2026-08-21',NULL,NULL,NULL,'Deep test payment - monthly rent',1,NULL,NULL,'2026-08-21 12:28:55','2026-08-21 12:28:55',NULL),
(251,18,1,'rent','cheque',23750.00,'2026-09-01',NULL,NULL,NULL,'First quarter instalment (CHQ-501101 cleared)',1,NULL,NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31',NULL),
(252,20,1,'rent','cheque',23750.00,'2026-09-01',NULL,NULL,NULL,'First quarter instalment (CHQ-501101 cleared)',1,NULL,NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28',NULL),
(253,22,1,'rent','cheque',23750.00,'2026-09-01',NULL,NULL,NULL,'First quarter instalment (CHQ-501101 cleared)',1,NULL,NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27',NULL),
(254,26,10,'rent','bank_transfer',25000.00,'2026-09-03',NULL,NULL,'TXN-152808','Q3 Rent instalment received via Emirates NBD',1,1,'Cancelled by administrator','2026-09-03 05:28:08','2026-09-11 11:55:44','2026-09-11 11:55:44'),
(255,5,5,'rent','bank_transfer',25000.00,'2026-09-03',NULL,NULL,'TXN-153720','Q3 Rent instalment received via Emirates NBD',1,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20',NULL),
(256,13,1,'rent','cash',36000.00,'2026-09-06',NULL,NULL,NULL,'nothing',1,NULL,NULL,'2026-09-06 11:51:25','2026-09-06 11:51:25',NULL),
(257,13,1,'dewa','cash',40000.00,'2026-09-06',NULL,NULL,NULL,'nothing',1,NULL,NULL,'2026-09-06 11:51:57','2026-09-06 11:51:57',NULL),
(258,28,4,'rent','cash',40000.00,'2026-09-07',NULL,NULL,NULL,'nothing',1,1,'Cancelled by administrator','2026-09-07 03:29:39','2026-09-07 04:58:49','2026-09-07 04:58:49'),
(259,28,4,'rent','cash',50000.00,'2026-09-07',NULL,NULL,NULL,'nothing',1,1,'Cancelled by administrator','2026-09-07 03:30:38','2026-09-07 04:59:02','2026-09-07 04:59:02'),
(260,26,10,'dewa','cash',30000.00,'2026-09-07',NULL,NULL,NULL,'nothing',1,NULL,NULL,'2026-09-07 04:14:14','2026-09-07 04:14:14',NULL),
(261,26,10,'dewa','cash',3000.00,'2026-09-07',NULL,NULL,NULL,'nothing',1,NULL,NULL,'2026-09-07 04:15:12','2026-09-07 04:15:12',NULL),
(262,28,4,'rent','cash',20000.00,'2026-09-07',NULL,NULL,NULL,NULL,1,1,'Cancelled by administrator','2026-09-07 04:46:16','2026-09-07 04:55:25','2026-09-07 04:55:25'),
(263,28,4,'rent','cash',40000.00,'2026-09-07',NULL,NULL,NULL,'Test monthly payment',1,1,'Cancelled by administrator','2026-09-07 05:05:27','2026-09-07 05:05:52','2026-09-07 05:05:52'),
(264,28,4,'rent','cash',2300.00,'2026-07-25',NULL,NULL,NULL,'July Rent',1,1,'Deleted by administrator','2026-09-07 05:13:26','2026-09-07 05:23:47','2026-09-07 05:23:47'),
(265,28,4,'rent','bank_transfer',2300.00,'2026-08-28',NULL,NULL,NULL,'City bank transfer',1,1,'Cancelled by administrator','2026-09-07 05:13:26','2026-09-07 05:13:42','2026-09-07 05:13:42'),
(266,28,4,'rent','bank_transfer',2500.00,'2026-09-27',NULL,NULL,NULL,'adcb',1,1,'Cancelled by administrator','2026-09-07 05:14:00','2026-09-07 05:29:04','2026-09-07 05:29:04'),
(267,28,4,'rent','bank_transfer',2500.00,'2026-10-25',NULL,NULL,NULL,'adcb',1,1,'Cancelled by administrator','2026-09-07 05:14:00','2026-09-07 05:29:07','2026-09-07 05:29:07'),
(268,28,4,'rent','cash',40000.00,'2026-09-07',NULL,NULL,NULL,'nothing',1,1,'Cancelled by administrator','2026-09-07 05:15:23','2026-09-07 05:29:01','2026-09-07 05:29:01'),
(269,24,1,'rent','cash',20000.00,'2026-09-07',NULL,NULL,NULL,NULL,1,1,'Cancelled by administrator','2026-09-07 05:21:40','2026-09-07 05:25:14','2026-09-07 05:25:14'),
(270,24,1,'dewa','cash',1000.00,'2026-09-07',NULL,NULL,NULL,NULL,1,1,'Cancelled by administrator','2026-09-07 05:26:00','2026-09-07 05:26:04','2026-09-07 05:26:04'),
(271,1,1,'rent','cash',100.00,'2026-09-16',NULL,NULL,NULL,NULL,21,NULL,NULL,'2026-09-16 02:27:44','2026-09-16 02:27:44',NULL),
(272,30,11,'rent','bank_transfer',22500.00,'2026-09-18',NULL,NULL,'E2E-TRX-060721','First quarterly rent payment verified',1,NULL,NULL,'2026-09-18 01:07:30','2026-09-18 01:07:30',NULL),
(273,31,11,'rent','bank_transfer',22500.00,'2026-09-18',NULL,NULL,'E2E-TRX-060931','First quarterly rent payment verified',1,NULL,NULL,'2026-09-18 01:09:33','2026-09-18 01:09:33',NULL),
(274,32,1,'rent','bank_transfer',22500.00,'2026-09-18',NULL,NULL,'E2E-TRX-061142','First quarterly rent payment verified',1,NULL,NULL,'2026-09-18 01:11:44','2026-09-18 01:11:44',NULL),
(275,33,1,'rent','bank_transfer',22500.00,'2026-09-18',NULL,NULL,'E2E-TRX-061357','First quarterly rent payment verified',1,NULL,NULL,'2026-09-18 01:13:59','2026-09-18 01:13:59',NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=336 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',1,'auth_token','66403dfb36c9ba09d8de76ac97bf338ce0d1c421ec904a0566071ff568f628c1','[\"*\"]','2026-08-10 04:29:26',NULL,'2026-08-10 04:29:16','2026-08-10 04:29:26'),
(2,'App\\Models\\User',3,'auth_token','96ed9728339d047e9c25bd77a07a02cc3d743792007ed456e003c65ffd259f8f','[\"*\"]','2026-08-10 04:29:17',NULL,'2026-08-10 04:29:16','2026-08-10 04:29:17'),
(3,'App\\Models\\User',9,'auth_token','e07a582faef335b28ef947a2db419f39b3747bfc7efb5f2ac02b54b4a2f4d9ff','[\"*\"]','2026-08-10 04:29:17',NULL,'2026-08-10 04:29:17','2026-08-10 04:29:17'),
(5,'App\\Models\\User',1,'auth_token','8dc394bad7d9770e3ef405ee35ca2894bb36ee92023de5fc0ef9f224cb24f2a6','[\"*\"]','2026-08-10 04:30:53',NULL,'2026-08-10 04:30:46','2026-08-10 04:30:53'),
(6,'App\\Models\\User',3,'auth_token','ba183272e2fa23d6aed1f99365c519f05910b4c606443875862d84d548524192','[\"*\"]','2026-08-10 04:30:48',NULL,'2026-08-10 04:30:47','2026-08-10 04:30:48'),
(7,'App\\Models\\User',9,'auth_token','93f9bee3ede93b83785aa0b5557a9c227973d3e416ee169ed7d332f27dc8cf7a','[\"*\"]','2026-08-10 04:30:48',NULL,'2026-08-10 04:30:48','2026-08-10 04:30:48'),
(18,'App\\Models\\User',1,'auth_token','0f2c786704afd94d84bb3acf8a8a10a0f2107d3c3488625d6f33bae6ef45253d','[\"*\"]','2026-08-16 14:22:16',NULL,'2026-08-16 09:17:05','2026-08-16 14:22:16'),
(26,'App\\Models\\User',1,'auth_token','c6056138f2a6f1449a1cf0baace2e7ed7d93aba7f590b0f21103741c0a6c87bb','[\"*\"]','2026-08-17 07:54:15',NULL,'2026-08-16 15:00:12','2026-08-17 07:54:15'),
(27,'App\\Models\\User',1,'test-admin','784c24364e63a72577399cd7ad5a26496629dc81bf3ae0e44fbae46d00ee6ba1','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(28,'App\\Models\\User',3,'test-owner','21f11d885da37813de954475a5d36c9f11ece9511fa1cc3b0f606ba9a05c823e','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(29,'App\\Models\\User',5,'test-tenant','b4cf3e39ab8aaad5381003d8204fc7cf287beda5d47ac0e87cbedfd9f3378e79','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(30,'App\\Models\\User',2,'test-maintenance','5959a38021e7856cd0413491d10088811702c513b00244ca3636283f58f4beef','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(31,'App\\Models\\User',1,'auth_token','1b82c97ddf577bfb155fb27a45bd8652920f855b412cc8bb39f931d6ac912cf8','[\"*\"]',NULL,NULL,'2026-08-17 03:04:53','2026-08-17 03:04:53'),
(32,'App\\Models\\User',3,'auth_token','3ae351d4837b02e933886ce7c684117a7c6a8376d8207687af8cf1ff74ec5ef9','[\"*\"]',NULL,NULL,'2026-08-17 03:04:54','2026-08-17 03:04:54'),
(33,'App\\Models\\User',5,'auth_token','5ded848a54ec9993d77d82c1d3f45e11f065e766df64cadb1dff0ba4fd0126ea','[\"*\"]',NULL,NULL,'2026-08-17 03:04:55','2026-08-17 03:04:55'),
(34,'App\\Models\\User',2,'auth_token','a7e4dbb955d2310c7b6cca40ada22a3b75c8d156ded84304f30d095c657ca9ea','[\"*\"]',NULL,NULL,'2026-08-17 03:04:55','2026-08-17 03:04:55'),
(35,'App\\Models\\User',1,'test-admin','5f1b4f72852176eb6b6b292a174fd73502c7c0c36e62217ab4511cdee11a2975','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(36,'App\\Models\\User',3,'test-owner','bfa8d82a7753a3df242fe28538d407839e7bc10495680688ad36373ee903f7b8','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(37,'App\\Models\\User',5,'test-tenant','460d4fcb7fbc45ebbc6981816137e67b4b03f8ccd72daaa07a55a9d4d36d639f','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(38,'App\\Models\\User',2,'test-maintenance','8d9342b4ee92db4c822570a3f225de3183bb99cea548c283075dff6caf707f0e','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(39,'App\\Models\\User',1,'auth_token','67a0e8436e1f6ca89d6dcd4f80e2ac442d803f31ff34d82459597201dce61849','[\"*\"]','2026-08-17 07:57:47',NULL,'2026-08-17 07:57:45','2026-08-17 07:57:47'),
(40,'App\\Models\\User',10,'auth_token','99e4bbecbddb049dae93bba29a1b712d41ab77aab1d871d657a13bc907335e0c','[\"*\"]',NULL,NULL,'2026-08-17 07:57:48','2026-08-17 07:57:48'),
(41,'App\\Models\\User',14,'auth_token','d903ebb1b22b7d77a534901846a9b6f2bed879f965906a6eebe16aca6f6b8a51','[\"*\"]',NULL,NULL,'2026-08-17 07:57:49','2026-08-17 07:57:49'),
(42,'App\\Models\\User',2,'auth_token','2cc2725d58e829ab685f3a0d6b08744c7df8ccddaebbd6b8f8a89aefcc1874a3','[\"*\"]',NULL,NULL,'2026-08-17 07:57:49','2026-08-17 07:57:49'),
(43,'App\\Models\\User',1,'auth_token','e69613a1e28305240477935050f450602b9caa22b00adb6208ab34f07dc83e31','[\"*\"]','2026-08-18 02:16:37',NULL,'2026-08-18 02:16:34','2026-08-18 02:16:37'),
(44,'App\\Models\\User',10,'auth_token','d40741d9d4e8257f03515fb7513d2249848c4b92d313ab24d751573ed76e9b7c','[\"*\"]','2026-08-18 02:16:39',NULL,'2026-08-18 02:16:38','2026-08-18 02:16:39'),
(45,'App\\Models\\User',14,'auth_token','b024ec6116ad892e2aefef3913544114a7a254573c3f0071a3fe9e0f714c6c43','[\"*\"]','2026-08-18 02:16:42',NULL,'2026-08-18 02:16:41','2026-08-18 02:16:42'),
(46,'App\\Models\\User',2,'auth_token','2448f13608a2d1cabfa495f19a5233282457164fb1325b88bb1c5f65435ef45c','[\"*\"]','2026-08-18 02:16:44',NULL,'2026-08-18 02:16:43','2026-08-18 02:16:44'),
(47,'App\\Models\\User',1,'auth_token','6c1fee3ef940d4140f48883396d4ff7da39dd060a2ba6dd354eb9810b748503e','[\"*\"]',NULL,NULL,'2026-08-18 02:20:13','2026-08-18 02:20:13'),
(48,'App\\Models\\User',1,'auth_token','8f5851d143eb6e222d0c4b113c3c3ba7917ded3068f7a7f91adb85b4ef3777b6','[\"*\"]',NULL,NULL,'2026-08-18 02:30:25','2026-08-18 02:30:25'),
(50,'App\\Models\\User',1,'auth_token','295db06464bcfd1bfb2272c6b09e3227f89312435018ad998589eab539a4771d','[\"*\"]','2026-08-18 02:52:51',NULL,'2026-08-18 02:52:49','2026-08-18 02:52:51'),
(51,'App\\Models\\User',1,'auth_token','735014c22071b72cb79ceb298a47c823b2cbf30ffdce49e7a8d31e5d7d6fbd47','[\"*\"]','2026-08-18 02:56:41',NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(52,'App\\Models\\User',3,'auth_token','2ff795a7f1d7d429ee2025c879b545245e4acad0394cd2aff41b42de86f8a500','[\"*\"]','2026-08-18 02:56:43',NULL,'2026-08-18 02:56:43','2026-08-18 02:56:43'),
(53,'App\\Models\\User',5,'auth_token','3c7f10373928f8ff4639100188d9e65575b9e90ec0f4dc03a298f22a5d4f6bf7','[\"*\"]','2026-08-18 02:56:44',NULL,'2026-08-18 02:56:44','2026-08-18 02:56:44'),
(65,'App\\Models\\User',1,'auth_token','aac31a75ddf46e4e6816f62ea9b3c75f4f0d29f87ce8d33a4f33bb809d9837ef','[\"*\"]','2026-08-20 12:22:44',NULL,'2026-08-20 12:22:44','2026-08-20 12:22:44'),
(66,'App\\Models\\User',1,'t','5104a6327aa132eadfe2ea38fb38c76f3e4d1ee6260d14f8fb89f56966649efd','[\"*\"]','2026-08-21 03:56:37',NULL,'2026-08-21 03:56:37','2026-08-21 03:56:37'),
(67,'App\\Models\\User',1,'test','39f74136e602e24c63c482091d7bebf8bc23156d0432e9b7e5e585b2ab588f61','[\"*\"]','2026-08-21 03:57:31',NULL,'2026-08-21 03:57:31','2026-08-21 03:57:31'),
(70,'App\\Models\\User',1,'test','4439e3b48c68345718033084bd08e450053551e4bfb669a35c381644a7c03a09','[\"*\"]','2026-08-21 07:38:13',NULL,'2026-08-21 07:38:12','2026-08-21 07:38:13'),
(77,'App\\Models\\User',1,'auth_token','100ea45312ba9e1a64239a350be74e90667eaefec863e97d0d15a62a40ed9d88','[\"*\"]',NULL,NULL,'2026-08-22 00:15:31','2026-08-22 00:15:31'),
(78,'App\\Models\\User',3,'auth_token','3511c0d84d8a673f3b08b582258acfd59b03bf1d1c33738f8ef8469e2f3872e2','[\"*\"]',NULL,NULL,'2026-08-22 00:15:50','2026-08-22 00:15:50'),
(79,'App\\Models\\User',5,'auth_token','b2d1a80e171bfdd9f179dd121a73cfa906d30e4a892fbfd051b138e2be99aded','[\"*\"]',NULL,NULL,'2026-08-22 00:17:15','2026-08-22 00:17:15'),
(80,'App\\Models\\User',2,'auth_token','7e90937b70896a05e235d8b05af369ca8a84262ae2628c41c882905062790650','[\"*\"]',NULL,NULL,'2026-08-22 00:17:15','2026-08-22 00:17:15'),
(81,'App\\Models\\User',1,'auth_token','2698b8480a751a854fff213cddbb5d0c3b95013a4286e862628eb67e5c374062','[\"*\"]',NULL,NULL,'2026-08-22 00:21:41','2026-08-22 00:21:41'),
(82,'App\\Models\\User',1,'auth_token','867f43dd0b80fca67b87dab82fbb869417fc56cfadd4bf1c299f2f36489a21fe','[\"*\"]',NULL,NULL,'2026-08-24 04:21:58','2026-08-24 04:21:58'),
(83,'App\\Models\\User',1,'auth_token','6992fd96ec275827162197078459ca4d9cba63056cb602909535c580363d7856','[\"*\"]',NULL,NULL,'2026-08-24 04:24:12','2026-08-24 04:24:12'),
(84,'App\\Models\\User',3,'auth_token','855df7dbb24cabdfbc979fce1047c7876e3d1ab8c2d159d62ed8f5b9d18b4be6','[\"*\"]',NULL,NULL,'2026-08-24 04:24:30','2026-08-24 04:24:30'),
(85,'App\\Models\\User',5,'auth_token','2e193bcbf7c6cec7a62e7a5abcef5c090ac715d36b8c6746d26b18cfeb7a062d','[\"*\"]',NULL,NULL,'2026-08-24 04:24:31','2026-08-24 04:24:31'),
(86,'App\\Models\\User',2,'auth_token','cfad728a7691c364204cdb193a0a140fc2e3694c6685ede45f87f636147acff2','[\"*\"]',NULL,NULL,'2026-08-24 04:24:32','2026-08-24 04:24:32'),
(87,'App\\Models\\User',1,'auth_token','67acd1c0fd6454c59fe351d212d74dbfc39329d9c2b60d10fe7c3660fc9c13a5','[\"*\"]',NULL,NULL,'2026-08-24 04:25:13','2026-08-24 04:25:13'),
(88,'App\\Models\\User',1,'auth_token','92350aa7f194644fd9b9291346e31c6ac843a841d76e23dc07929b04334e042a','[\"*\"]','2026-08-24 04:25:47',NULL,'2026-08-24 04:25:44','2026-08-24 04:25:47'),
(94,'App\\Models\\User',1,'auth_token','499f6e1cc44b41c7357bbbb0e784e45f82f317fb6b5be9cdbdcecac63ed4c6a6','[\"*\"]','2026-09-01 04:51:47',NULL,'2026-09-01 04:51:46','2026-09-01 04:51:47'),
(95,'App\\Models\\User',1,'auth_token','b66369ed7bb07e50ba3098c4595d42c9d8fb521fed3e565ba22ebdac2457d182','[\"*\"]','2026-09-01 04:59:42',NULL,'2026-09-01 04:59:40','2026-09-01 04:59:42'),
(96,'App\\Domain\\Auth\\Models\\User',1,'test_token','cc86e6afb894728fb012180af3643eb7de5b60fe9750a299a910c11a77a51414','[\"*\"]',NULL,NULL,'2026-09-02 12:08:42','2026-09-02 12:08:42'),
(97,'App\\Models\\User',1,'auth_token','767c3fc76b837fa2c93b4f0fbdfbfc42b0e68bbf0776e9196f39cf3521001a5e','[\"*\"]','2026-09-02 12:09:24',NULL,'2026-09-02 12:09:23','2026-09-02 12:09:24'),
(98,'App\\Models\\User',1,'auth_token','78310473b889f7fbbc28ea9eefabe35ac5b21213462978e28a9c5482dc4a2487','[\"*\"]','2026-09-02 12:09:35',NULL,'2026-09-02 12:09:35','2026-09-02 12:09:35'),
(99,'App\\Models\\User',1,'auth_token','4d49b053db90d737cf1d72797b454946697624e3f289188bb77eba586442e476','[\"*\"]','2026-09-02 12:09:49',NULL,'2026-09-02 12:09:48','2026-09-02 12:09:49'),
(100,'App\\Models\\User',1,'auth_token','1e10a675abffcdecce38ac5193e9f5ee86b458bb70b39d617da6452aabd41a26','[\"*\"]','2026-09-02 12:15:15',NULL,'2026-09-02 12:15:15','2026-09-02 12:15:15'),
(101,'App\\Models\\User',1,'auth_token','e2be25af879addb30fe763e740cab3c06655f8689c6e473ecbcbeec18303ed8f','[\"*\"]','2026-09-02 12:15:29',NULL,'2026-09-02 12:15:29','2026-09-02 12:15:29'),
(103,'App\\Models\\User',1,'auth_token','dd17cbdcf69f852bc559f39d066ca9eedbc52cbb1b4177d97ecfb6f11d6eff7b','[\"*\"]','2026-09-03 05:09:16',NULL,'2026-09-03 05:09:15','2026-09-03 05:09:16'),
(104,'App\\Models\\User',1,'auth_token','d011671b9013fccf1b51bd3efbc1e7f423fe010e0e2e3ac70ed0bb06c11fed7c','[\"*\"]','2026-09-03 05:09:47',NULL,'2026-09-03 05:09:46','2026-09-03 05:09:47'),
(105,'App\\Models\\User',1,'auth_token','c8251ffda8487cae89698f1cca61a6d479961f5106b11c13ba7872f6acca8769','[\"*\"]','2026-09-03 05:10:06',NULL,'2026-09-03 05:10:06','2026-09-03 05:10:06'),
(106,'App\\Models\\User',1,'auth_token','acfb56f6d9a77612a75be94b0e7480d63a275a2482df2868c67203e445cb32a4','[\"*\"]','2026-09-03 05:20:38',NULL,'2026-09-03 05:20:27','2026-09-03 05:20:38'),
(107,'App\\Models\\User',1,'auth_token','04a97e46ee91ffa737080e779d1c1a032efaf3ca34d1e70a333f79187b8e7b54','[\"*\"]','2026-09-03 05:28:24',NULL,'2026-09-03 05:28:00','2026-09-03 05:28:24'),
(108,'App\\Models\\User',1,'auth_token','df07a2fb8eebf4b04b59655c60993d274bc151af27ffd003e8cb9635316779b0','[\"*\"]','2026-09-03 05:37:29',NULL,'2026-09-03 05:37:17','2026-09-03 05:37:29'),
(109,'App\\Models\\User',1,'auth_token','3e0a9699f5e228eec9d8f6adee6fc81ec67232088d607a1dcd224e65b42c8e65','[\"*\"]','2026-09-04 10:01:07',NULL,'2026-09-03 09:38:44','2026-09-04 10:01:07'),
(110,'App\\Models\\User',1,'auth_token','a4cbf305ee500a4a4d8a21a50869192cc3e7cd0c125fb35eb706d2ed07d5b0c1','[\"*\"]','2026-09-04 07:28:58',NULL,'2026-09-04 07:28:57','2026-09-04 07:28:58'),
(112,'App\\Models\\User',1,'auth_token','d89b42900715c130bb28e152a42ed10bba83c08d917e24988e66369d6882148f','[\"*\"]',NULL,NULL,'2026-09-04 13:01:01','2026-09-04 13:01:01'),
(113,'App\\Models\\User',1,'auth_token','b5bc13b073c623027d70708831e8feeeca4429427a93928127d33cbd0892110a','[\"*\"]',NULL,NULL,'2026-09-04 13:03:01','2026-09-04 13:03:01'),
(118,'App\\Models\\User',5,'auth_token','e1a4fcfff104120eff397a72f98d8fd1b317b639fc1b4c50fd18f2cf74e88b9a','[\"*\"]','2026-09-05 14:22:36',NULL,'2026-09-05 14:22:35','2026-09-05 14:22:36'),
(127,'App\\Models\\User',1,'auth_token','9b471c6a87473a5bf4b6a82f7c1bbc1b54aea3ffc0896365bb4e983a316fb19d','[\"*\"]','2026-09-06 11:51:30',NULL,'2026-09-06 11:51:30','2026-09-06 11:51:30'),
(128,'App\\Models\\User',1,'auth_token','e829d3b146266592aa80c9be18a08557526e273af17d48db70abe28b70b460b1','[\"*\"]','2026-09-06 11:52:17',NULL,'2026-09-06 11:52:16','2026-09-06 11:52:17'),
(129,'App\\Models\\User',3,'auth_token','a4af422d6ab9dc9ad2eebe41ab4ce4f5986af196fb3ee95ae01c8321300721f1','[\"*\"]','2026-09-06 11:52:18',NULL,'2026-09-06 11:52:17','2026-09-06 11:52:18'),
(130,'App\\Models\\User',5,'auth_token','43768bd9a6671c3f7663ee072cbc1e5aaf86e4f0495b2c97249542ca0156eb38','[\"*\"]','2026-09-06 11:52:18',NULL,'2026-09-06 11:52:18','2026-09-06 11:52:18'),
(131,'App\\Models\\User',2,'auth_token','b5b5f6fa31327062bd49d52fcd25df28032d687edf730d6e0754f354e10c5dcb','[\"*\"]','2026-09-06 11:52:19',NULL,'2026-09-06 11:52:19','2026-09-06 11:52:19'),
(139,'App\\Models\\User',1,'auth_token','9cb8f9e19cc39ca4a9e40da3588d47398d65d2a062d9c80158a959d537362981','[\"*\"]','2026-09-07 06:22:15',NULL,'2026-09-06 12:14:31','2026-09-07 06:22:15'),
(140,'App\\Models\\User',1,'auth_token','d107bf84aec3aae281fd8dfdf8bfb4ab57f0785211b8f0709971965cc5dcb3e1','[\"*\"]','2026-09-07 03:24:15',NULL,'2026-09-07 03:24:14','2026-09-07 03:24:15'),
(141,'App\\Models\\User',1,'auth_token','4d49daf811734103496991e6004d84bf795229e1ef560bf28762f18c8de8520e','[\"*\"]','2026-09-07 03:24:41',NULL,'2026-09-07 03:24:41','2026-09-07 03:24:41'),
(142,'App\\Models\\User',1,'auth_token','111e0e42f22834be6e9e98e9545a5b3c2eb2c28aade9fd897140806bb6104dc6','[\"*\"]','2026-09-07 03:25:25',NULL,'2026-09-07 03:25:25','2026-09-07 03:25:25'),
(143,'App\\Models\\User',1,'auth_token','ccc1139cf367d62ade6c8af1974a5db7511ec4dfb9d87830c2552910f7c15cc8','[\"*\"]','2026-09-07 03:26:39',NULL,'2026-09-07 03:26:38','2026-09-07 03:26:39'),
(144,'App\\Models\\User',1,'auth_token','cf691ebaa3b2de3aa17de8f0298fc6568aca4ccfbfc5ea71625c461c1d542731','[\"*\"]','2026-09-07 04:16:07',NULL,'2026-09-07 04:16:07','2026-09-07 04:16:07'),
(145,'App\\Models\\User',1,'auth_token','77f80f4d8215fdb8d7a952748464a4b31ffc3816fb409b99c65eb7a68c589c66','[\"*\"]','2026-09-07 04:20:16',NULL,'2026-09-07 04:20:15','2026-09-07 04:20:16'),
(146,'App\\Models\\User',1,'auth_token','fecee489fa8a0808828610e8021040151b846c2174b5b6c90f77282bdd2b2671','[\"*\"]','2026-09-07 04:24:37',NULL,'2026-09-07 04:24:36','2026-09-07 04:24:37'),
(147,'App\\Models\\User',1,'auth_token','6262b80a42e2f235fb38af2b54f404d552806265268dec40625aad13032097a6','[\"*\"]',NULL,NULL,'2026-09-07 04:42:37','2026-09-07 04:42:37'),
(148,'App\\Models\\User',1,'auth_token','baa46501f7c4b41f11279866244d19cf50c18fed5de999809804c9595622c6a9','[\"*\"]',NULL,NULL,'2026-09-07 04:42:47','2026-09-07 04:42:47'),
(149,'App\\Models\\User',1,'auth_token','62871c7553cf665466ce45a90c14992127c80d039b28e68979bbddfdfac3749c','[\"*\"]','2026-09-07 04:42:58',NULL,'2026-09-07 04:42:58','2026-09-07 04:42:58'),
(150,'App\\Models\\User',1,'auth_token','63fc405ec1a21b39bee26a8bc9f41eb0b854e69fb29d81c2d695bf09c8862b79','[\"*\"]','2026-09-07 04:43:12',NULL,'2026-09-07 04:43:11','2026-09-07 04:43:12'),
(151,'App\\Models\\User',1,'auth_token','d54a7499c5c5092e6dee2b90f2b866f1f386c24dd0de3a12cb57ce358ffaf258','[\"*\"]','2026-09-07 04:43:23',NULL,'2026-09-07 04:43:23','2026-09-07 04:43:23'),
(152,'App\\Models\\User',1,'auth_token','3438e8a8347f7c147ae49e40b469a558a6faaf90ddcc1b1f6adcb6940664cff9','[\"*\"]','2026-09-07 04:43:42',NULL,'2026-09-07 04:43:41','2026-09-07 04:43:42'),
(153,'App\\Models\\User',1,'auth_token','b2ddb7de24713bdd6e9a11ff998b8c0a155bd8690ae4480c93c394d905cfad39','[\"*\"]','2026-09-07 04:55:05',NULL,'2026-09-07 04:55:05','2026-09-07 04:55:05'),
(154,'App\\Models\\User',1,'auth_token','d6a71640ebe4fa8211264376550e6ab13270962f04bc52701940d191db3cf5ac','[\"*\"]','2026-09-07 04:55:25',NULL,'2026-09-07 04:55:24','2026-09-07 04:55:25'),
(155,'App\\Models\\User',1,'auth_token','be6b1015ae9b29fac3982acccab22f39ac199b9b50e347555d44921cf0a1c1b7','[\"*\"]','2026-09-07 05:05:27',NULL,'2026-09-07 05:05:26','2026-09-07 05:05:27'),
(156,'App\\Models\\User',1,'auth_token','5136dc038e663d41370b023732acd5b34046ff9b19ccd3fac0dbdab99f7851f2','[\"*\"]','2026-09-07 05:05:39',NULL,'2026-09-07 05:05:38','2026-09-07 05:05:39'),
(157,'App\\Models\\User',1,'auth_token','9d23cb0ba851fff3122a5ea708c491f2369e63a66d9b2e09f37fa15f03d77b9e','[\"*\"]','2026-09-07 05:05:51',NULL,'2026-09-07 05:05:51','2026-09-07 05:05:51'),
(158,'App\\Models\\User',1,'auth_token','033e5dace6e8e8ae1d10824e676b43102b4d45bc32273832b91be6936654bf44','[\"*\"]','2026-09-07 05:09:23',NULL,'2026-09-07 05:09:22','2026-09-07 05:09:23'),
(159,'App\\Models\\User',1,'auth_token','f78e78d0ad44146d1c27bbc431a99c703dcd616651da6586094e79110fd46cba','[\"*\"]','2026-09-07 05:09:38',NULL,'2026-09-07 05:09:38','2026-09-07 05:09:38'),
(160,'App\\Models\\User',1,'auth_token','93fadaf080d8679420144170b64d4b47f790b56ca3c0edd0b17f36930d5f7a1c','[\"*\"]','2026-09-07 05:13:26',NULL,'2026-09-07 05:13:25','2026-09-07 05:13:26'),
(161,'App\\Models\\User',1,'auth_token','a6760a9a3ba8cb6681f26f34873ba90c754605b6b0150e0d5725994070dccf40','[\"*\"]','2026-09-07 05:13:42',NULL,'2026-09-07 05:13:42','2026-09-07 05:13:42'),
(162,'App\\Models\\User',1,'auth_token','a056947fe9ddb7eee44c43519e4bdfca1e0b3fa9ada084f7d58b33c0e4122b79','[\"*\"]','2026-09-07 05:14:00',NULL,'2026-09-07 05:14:00','2026-09-07 05:14:00'),
(163,'App\\Models\\User',1,'auth_token','30991f7f921e6363dd347b41f9df5a1bc721a68fa70371133f614f48bea39ca7','[\"*\"]','2026-09-07 05:14:13',NULL,'2026-09-07 05:14:13','2026-09-07 05:14:13'),
(164,'App\\Models\\User',1,'auth_token','baef7a3d9c7e1ae9a742f1fe84694526e9e512a3537ec3686285593bbc0f64c4','[\"*\"]','2026-09-07 05:23:47',NULL,'2026-09-07 05:23:46','2026-09-07 05:23:47'),
(165,'App\\Models\\User',1,'auth_token','38bf62e989df38095c8068ce12dc1c7f4641a1e97385fbfaf15971b4f0517a45','[\"*\"]','2026-09-07 05:28:02',NULL,'2026-09-07 05:28:02','2026-09-07 05:28:02'),
(166,'App\\Models\\User',1,'auth_token','cc2e363476ac87cbbabd29656fc670121df51e56dca383c638b17f22a5de28cf','[\"*\"]',NULL,NULL,'2026-09-09 11:48:06','2026-09-09 11:48:06'),
(167,'App\\Models\\User',1,'auth_token','f8cd7a0eb94f347338c055eb7d5528605f7afa7c1da2bd98e4f2bd8e7ccf61b4','[\"*\"]','2026-09-09 12:25:00',NULL,'2026-09-09 12:16:39','2026-09-09 12:25:00'),
(168,'App\\Models\\User',1,'auth_token','974606d61e9cb0f0ba0332026aa0c6d36e6d615efd5c127baacd7faaee32b7a5','[\"*\"]','2026-09-10 03:48:11',NULL,'2026-09-09 13:01:40','2026-09-10 03:48:11'),
(169,'App\\Models\\User',1,'auth_token','02fd184f54b9f5879e477c63b49fcd13205fe8c8bb095634dcec9f4b255c2311','[\"*\"]','2026-09-10 03:50:28',NULL,'2026-09-10 03:49:43','2026-09-10 03:50:28'),
(170,'App\\Models\\User',1,'auth_token','733a0587a0ee5235bc01b632d8f324f26520fd2be5e2038320bcbf12d296d37c','[\"*\"]','2026-09-11 02:50:37',NULL,'2026-09-10 05:10:23','2026-09-11 02:50:37'),
(171,'App\\Models\\User',1,'auth_token','8bf96991fec38115812082fe3d6da89921306e27b31da55da9184813c6f6510d','[\"*\"]','2026-09-11 07:47:10',NULL,'2026-09-11 03:24:23','2026-09-11 07:47:10'),
(172,'App\\Models\\User',1,'auth_token','87921597299fbd4bf03c0ec30620a257fd1a7c90406de53a06272829d4decd95','[\"*\"]','2026-09-11 03:24:52',NULL,'2026-09-11 03:24:51','2026-09-11 03:24:52'),
(173,'App\\Models\\User',1,'auth_token','74c07cc051e52dd24bc43a1ab2a849f76689b1a247babaac2be39c44634bce68','[\"*\"]','2026-09-11 03:27:28',NULL,'2026-09-11 03:27:27','2026-09-11 03:27:28'),
(174,'App\\Models\\User',1,'auth_token','4cd0f04bddfd331b938a6a80aa994f9ad753edd72fd7a86af30b15e560118ae5','[\"*\"]','2026-09-11 11:47:37',NULL,'2026-09-11 03:38:49','2026-09-11 11:47:37'),
(191,'App\\Models\\User',1,'auth_token','9ca124c54f83b8650d1f13b66cf4cfbefb5cf889f8cf7502e583099944b993a0','[\"*\"]','2026-09-12 01:11:05',NULL,'2026-09-11 13:35:14','2026-09-12 01:11:05'),
(193,'App\\Models\\User',1,'auth_token','12f7f247494ccf9de472a518f4e52dbc8d1366596c6570fdaae305a51b0b0553','[\"*\"]','2026-09-12 09:57:45',NULL,'2026-09-12 01:22:46','2026-09-12 09:57:45'),
(194,'App\\Models\\User',1,'auth_token','d47c091c5f875703111e88d6a89802cc3bdc753b0683e83a29cb7f224f7783b4','[\"*\"]','2026-09-12 10:13:17',NULL,'2026-09-12 10:05:27','2026-09-12 10:13:17'),
(202,'App\\Models\\User',1,'auth_token','f4e95c1ad5f69c7dc5361ffa48724779883ad6d08c94443f1f12188a01d196a9','[\"*\"]',NULL,NULL,'2026-09-16 01:55:08','2026-09-16 01:55:08'),
(203,'App\\Models\\User',3,'auth_token','bf8c70a34d073f32cbce12d08d19fde75cc40af076970b8d683558256c856c2a','[\"*\"]',NULL,NULL,'2026-09-16 01:55:19','2026-09-16 01:55:19'),
(204,'App\\Models\\User',3,'auth_token','bb060970b7f3430905c604f40c6d11a61526a4860bfcf96e9fe3b1d22dfd1656','[\"*\"]','2026-09-16 01:55:30',NULL,'2026-09-16 01:55:30','2026-09-16 01:55:30'),
(205,'App\\Models\\User',3,'auth_token','385d529c7eca9c992f1040385850a9895fb86af08ef1359b1195d3caf90459b7','[\"*\"]','2026-09-16 01:55:41',NULL,'2026-09-16 01:55:41','2026-09-16 01:55:41'),
(206,'App\\Models\\User',3,'auth_token','ff5a2e2f30390f95d494b6608962a62eb602eede362853eee1aeb86f31dd4652','[\"*\"]','2026-09-16 01:55:56',NULL,'2026-09-16 01:55:56','2026-09-16 01:55:56'),
(217,'App\\Models\\User',3,'auth_token','c42c1591ec05ce83201536fd819196130798ee600bf735a4b54afb77041cfb55','[\"*\"]','2026-09-16 02:25:40',NULL,'2026-09-16 02:25:33','2026-09-16 02:25:40'),
(220,'App\\Models\\User',3,'auth_token','b1e22451d19a77ed0c80c70a787ac6eee90b05154ce9032672691d379936d72e','[\"*\"]','2026-09-16 02:48:45',NULL,'2026-09-16 02:48:44','2026-09-16 02:48:45'),
(221,'App\\Models\\User',3,'auth_token','531cdf2770587aff80ea85497b64775163892d2f17e43f38f54461ba657f1a83','[\"*\"]','2026-09-16 02:49:14',NULL,'2026-09-16 02:49:09','2026-09-16 02:49:14'),
(225,'App\\Models\\User',3,'auth_token','ca9b0a2e7b17316ae8b0380e79a909a75bb16eb76ffc45ad4f14362c52f48e16','[\"*\"]','2026-09-16 02:51:37',NULL,'2026-09-16 02:51:31','2026-09-16 02:51:37'),
(228,'App\\Models\\User',21,'auth_token','6793934bb69b14c8da41c5815df73e095fe19965e3484db73919728dcbf62b20','[\"*\"]','2026-09-16 03:00:08',NULL,'2026-09-16 03:00:08','2026-09-16 03:00:08'),
(232,'App\\Models\\User',2,'auth_token','a4fd3859da0f26c4c9aa3e50fd76d209fd69c844abc22c824f1e936267d81d05','[\"*\"]',NULL,NULL,'2026-09-16 03:47:42','2026-09-16 03:47:42'),
(233,'App\\Models\\User',23,'auth_token','4f7b7826d12ff2a5c58ebf94cc14a4ec0c0cbb88ac9ededb81d7e258ede4283e','[\"*\"]',NULL,NULL,'2026-09-16 03:53:53','2026-09-16 03:53:53'),
(234,'App\\Models\\User',23,'auth_token','7a151c835e90ceb004496c373af70f4887cb6fa201ee44dd68a8b1782fdcfc0e','[\"*\"]','2026-09-16 03:54:48',NULL,'2026-09-16 03:54:48','2026-09-16 03:54:48'),
(236,'App\\Models\\User',2,'auth_token','8f785dbeb0e0b9c47238fb52f04a8eeb7040d1f458aa7185f6a293e7fd5a94d9','[\"*\"]','2026-09-16 04:03:54',NULL,'2026-09-16 04:03:54','2026-09-16 04:03:54'),
(239,'App\\Models\\User',9,'auth_token','d87a113bcfc951dabdf8b2090c19f568748aa9669c7c50b1356517b77c801990','[\"*\"]','2026-09-16 04:17:35',NULL,'2026-09-16 04:17:35','2026-09-16 04:17:35'),
(240,'App\\Models\\User',14,'auth_token','7b3a52f35838f98d241ac2e6584d09f5cad423dadc8fca2f732fff6d9526eea1','[\"*\"]','2026-09-16 04:18:11',NULL,'2026-09-16 04:18:11','2026-09-16 04:18:11'),
(243,'App\\Models\\User',1,'auth_token','2720130624f1dfa94237c94cb418f7c18d481009958f5d9da55641497283a6d8','[\"*\"]','2026-09-16 05:24:41',NULL,'2026-09-16 05:24:41','2026-09-16 05:24:41'),
(249,'App\\Models\\User',22,'auth_token','306ee79dcfe27aba8bc81817b7cc79b64bf21400160324039af32053570c3012','[\"*\"]','2026-09-16 09:26:10',NULL,'2026-09-16 09:00:37','2026-09-16 09:26:10'),
(273,'App\\Models\\User',1,'auth_token','2bba6536db0c4e62d0a4f53e91f459e0d2e2e8f7e8f69471f7d1df79f16a91d3','[\"*\"]','2026-09-17 02:54:03',NULL,'2026-09-16 14:25:22','2026-09-17 02:54:03'),
(276,'App\\Models\\User',3,'auth_token','2d406b0c64fdb4decaecbb2e4cc07911e0101b5de5a18748ac4b42457e9fce0d','[\"*\"]','2026-09-17 02:16:55',NULL,'2026-09-17 01:33:27','2026-09-17 02:16:55'),
(277,'App\\Models\\User',1,'auth_token','2e96e04e7475f91cefc9013b93d71eb90d8b2c226eda9764b0eab88f568d2408','[\"*\"]',NULL,NULL,'2026-09-17 12:21:50','2026-09-17 12:21:50'),
(278,'App\\Models\\User',1,'auth_token','955ac1ce8f085ff34d50e6917dfe1ad1ab14c13eaa8e3e28cc8f6ba060a32201','[\"*\"]',NULL,NULL,'2026-09-17 12:28:34','2026-09-17 12:28:34'),
(279,'App\\Models\\User',1,'auth_token','b158ceeaedee472e769b39b642aec3d6397f97aba231a3d33f96263c5c74aea6','[\"*\"]','2026-09-17 12:29:39',NULL,'2026-09-17 12:29:39','2026-09-17 12:29:39'),
(280,'App\\Models\\User',3,'auth_token','f096a0c7f8eff2e13faed03ee15eb1084b9d40fc384aa31928c13d2c76a386ad','[\"*\"]','2026-09-17 12:31:58',NULL,'2026-09-17 12:31:58','2026-09-17 12:31:58'),
(282,'App\\Models\\User',1,'auth_token','1af001873d9cd8bba8e2a55e81024b7b97b797bc165b04a5ee991a0280d96ab9','[\"*\"]','2026-09-17 14:23:43',NULL,'2026-09-17 13:21:24','2026-09-17 14:23:43'),
(283,'App\\Models\\User',3,'auth_token','488901b21316d8eb9c5d5f7efbee0e73be0dc8c1c6c2fd47bc4a46349b640194','[\"*\"]','2026-09-17 14:02:19',NULL,'2026-09-17 14:02:19','2026-09-17 14:02:19'),
(284,'App\\Models\\User',1,'auth_token','1340a9969551de0a71618161111ed4e7ca208e7f104cc04f09a3b95b2454ca0c','[\"*\"]','2026-09-17 14:34:16',NULL,'2026-09-17 14:34:16','2026-09-17 14:34:16'),
(288,'App\\Models\\User',1,'auth_token','0df2521ad780d4883ea768f02b059e9284b80bfd7e5940286d61d8d722f96f1a','[\"*\"]','2026-09-18 02:34:03',NULL,'2026-09-18 00:32:34','2026-09-18 02:34:03'),
(289,'App\\Models\\User',1,'auth_token','28c0e1caac4810f8eed1dae8964ec693d283779883e84d46f9a993a0c1a90692','[\"*\"]','2026-09-18 00:56:02',NULL,'2026-09-18 00:56:02','2026-09-18 00:56:02'),
(290,'App\\Models\\User',1,'auth_token','def241c88a2c0c62132d7f9132678b8ea1cd11b687650d400440d33176fd9e6d','[\"*\"]',NULL,NULL,'2026-09-18 01:06:22','2026-09-18 01:06:22'),
(291,'App\\Models\\User',1,'auth_token','d2378bf1f2b96852f004ce83a1b5dbd272637df125a308a162b595894e28a70f','[\"*\"]','2026-09-18 01:07:46',NULL,'2026-09-18 01:07:16','2026-09-18 01:07:46'),
(292,'App\\Models\\User',3,'auth_token','45281cfb61b464069af5b9a8daffbbbd261d57e4233b1b59806eae77bf8f7957','[\"*\"]','2026-09-18 01:07:45',NULL,'2026-09-18 01:07:17','2026-09-18 01:07:45'),
(293,'App\\Models\\User',4,'auth_token','f2ab9f2be3806f3b9b287ce909c59ea5026d6e6da25a497eb37d2216728804c9','[\"*\"]','2026-09-18 01:07:46',NULL,'2026-09-18 01:07:18','2026-09-18 01:07:46'),
(294,'App\\Models\\User',9,'auth_token','b7949196c90e261a39acd49bb61249281f8ba92be5332ba7765a2f7c1ebc2b19','[\"*\"]','2026-09-18 01:07:32',NULL,'2026-09-18 01:07:19','2026-09-18 01:07:32'),
(295,'App\\Models\\User',2,'auth_token','6674ddb48ebb1daacdcd245ec613d564609672f81d27581694cd1681b3ccf8d9','[\"*\"]','2026-09-18 01:07:33',NULL,'2026-09-18 01:07:19','2026-09-18 01:07:33'),
(296,'App\\Models\\User',1,'auth_token','5d33eb6f2514f3ec3c302115b5f032f8f8989b94c3aced1ae43547e0246efb8a','[\"*\"]','2026-09-18 01:09:40',NULL,'2026-09-18 01:09:27','2026-09-18 01:09:40'),
(297,'App\\Models\\User',3,'auth_token','668baa0dc27cbf6d3af4885190f00903aabf20b9d9c3b4d0986153832eb79c56','[\"*\"]','2026-09-18 01:09:39',NULL,'2026-09-18 01:09:28','2026-09-18 01:09:39'),
(298,'App\\Models\\User',4,'auth_token','f211b319f9dd243b101f9745fcfdba9ab181ff12a1bb4ccc8a7a3f8b4d999d22','[\"*\"]','2026-09-18 01:09:39',NULL,'2026-09-18 01:09:29','2026-09-18 01:09:39'),
(299,'App\\Models\\User',9,'auth_token','39edb290b95c92beb5b087b967e6b16d6fd490bda16d7761f306f8df24251fed','[\"*\"]','2026-09-18 01:09:34',NULL,'2026-09-18 01:09:29','2026-09-18 01:09:34'),
(300,'App\\Models\\User',2,'auth_token','012b013987e432c9ee405064faac9c1a375d7c08a1487eb00371d4c9fa674412','[\"*\"]','2026-09-18 01:09:35',NULL,'2026-09-18 01:09:30','2026-09-18 01:09:35'),
(301,'App\\Models\\User',1,'auth_token','2bf827336b39f88aed1cb40af902930e6eb48a93ea0ce0089c77f1f8a9ec0ae6','[\"*\"]','2026-09-18 01:11:50',NULL,'2026-09-18 01:11:38','2026-09-18 01:11:50'),
(302,'App\\Models\\User',3,'auth_token','5a881efd20fb0feb5a186b6d5f3d75ae4fbdf204e65296303ddef418fbbbfbab','[\"*\"]','2026-09-18 01:11:50',NULL,'2026-09-18 01:11:38','2026-09-18 01:11:50'),
(303,'App\\Models\\User',4,'auth_token','e90704ff070875164b923976dca0a37fcc98ec99fff1e68b0c87113422b894bb','[\"*\"]','2026-09-18 01:11:50',NULL,'2026-09-18 01:11:39','2026-09-18 01:11:50'),
(304,'App\\Models\\User',5,'auth_token','179e059bd66c9629c968ac52200b8b0c0accad7f553cae3becd578f2722129a4','[\"*\"]','2026-09-18 01:11:45',NULL,'2026-09-18 01:11:40','2026-09-18 01:11:45'),
(305,'App\\Models\\User',2,'auth_token','27bb98b309342fa0552bdb22f9e548fd9e07836d98b58a8cffc6596a8b16541f','[\"*\"]','2026-09-18 01:11:41',NULL,'2026-09-18 01:11:41','2026-09-18 01:11:41'),
(306,'App\\Models\\User',1,'auth_token','2691c584f16a519823f628a9f9a39c5832ac891d675b0a136a366f30d05d8b1e','[\"*\"]','2026-09-18 01:14:06',NULL,'2026-09-18 01:13:53','2026-09-18 01:14:06'),
(307,'App\\Models\\User',3,'auth_token','05b92f8a96b3bce2b5ed381b0508856a10799ff77c3c13e23b6cba8b75572fd3','[\"*\"]','2026-09-18 01:14:05',NULL,'2026-09-18 01:13:54','2026-09-18 01:14:05'),
(308,'App\\Models\\User',4,'auth_token','22831db889173946bdd98c48eff612ecf2ea2cf7945966cc7758e3bb73a9f4e2','[\"*\"]','2026-09-18 01:14:05',NULL,'2026-09-18 01:13:55','2026-09-18 01:14:05'),
(309,'App\\Models\\User',5,'auth_token','b6a4320c8adf9ddaf028a85ecffd7c1481782c8e99e5b4c85c4ad9e7fd3cef0e','[\"*\"]','2026-09-18 01:14:00',NULL,'2026-09-18 01:13:55','2026-09-18 01:14:00'),
(310,'App\\Models\\User',2,'auth_token','bcb4452635ea4aa4ea8a257f4813ecb9867975baa7784a53a32707303023bc47','[\"*\"]','2026-09-18 01:14:01',NULL,'2026-09-18 01:13:56','2026-09-18 01:14:01'),
(311,'App\\Models\\User',1,'auth_token','65fc8c06cc7ea89710eed28d04ee1bf3da25f898d0f61a714e3b254d437d4b00','[\"*\"]','2026-09-18 04:48:08',NULL,'2026-09-18 04:48:05','2026-09-18 04:48:08'),
(312,'App\\Models\\User',1,'auth_token','ad294aca71d75344314f7a95aa06ae80954129a711ac76948b5303fd1d7ce210','[\"*\"]','2026-09-18 04:59:07',NULL,'2026-09-18 04:59:05','2026-09-18 04:59:07'),
(313,'App\\Models\\User',26,'auth_token','323b4ecb3a583622253689a07ad0b74dc41da082f8322d286ac4f7555785cd50','[\"*\"]',NULL,NULL,'2026-09-18 05:02:47','2026-09-18 05:02:47'),
(314,'App\\Models\\User',1,'auth_token','039d40f14d297c479758fc49c07b6961e6ac339dc6c37a26b0ab07a261fc35f8','[\"*\"]',NULL,NULL,'2026-09-18 05:03:52','2026-09-18 05:03:52'),
(315,'App\\Models\\User',2,'auth_token','03529584f6f5c430e93046340938d1d40dbdf73abfdc4f6e29808db20db6e6f5','[\"*\"]',NULL,NULL,'2026-09-18 05:03:55','2026-09-18 05:03:55'),
(316,'App\\Models\\User',3,'auth_token','dd00e55394e83d5793a0479fa1a19ea987986941cdb6f13146b1f02141b1007c','[\"*\"]',NULL,NULL,'2026-09-18 05:03:56','2026-09-18 05:03:56'),
(317,'App\\Models\\User',5,'auth_token','53ec823b3f5a6a51abf6e7d02933e37df998329fd2a93bd501923f3c3b53c450','[\"*\"]',NULL,NULL,'2026-09-18 05:03:58','2026-09-18 05:03:58'),
(318,'App\\Models\\User',21,'auth_token','4617f93503daf411cd569f6e6f04749c67fa457b6ffd50a0fd8567de3347a108','[\"*\"]',NULL,NULL,'2026-09-18 05:04:00','2026-09-18 05:04:00'),
(319,'App\\Models\\User',22,'auth_token','fac0bb7bf6e7bf3400bd31126c6736726c3e1f7795109a651ce40a959ff5bab2','[\"*\"]',NULL,NULL,'2026-09-18 05:04:02','2026-09-18 05:04:02'),
(320,'App\\Models\\User',1,'auth_token','136e6a9a27db5705a7880f642ab3052bb6eeb6b3c484a164a4272c258787194c','[\"*\"]','2026-09-18 05:05:06',NULL,'2026-09-18 05:05:05','2026-09-18 05:05:06'),
(321,'App\\Models\\User',3,'auth_token','9ac336bf60064764a833c1fcd700557dd1c3515bfede4e59feffe9c3f79d25a3','[\"*\"]',NULL,NULL,'2026-09-18 05:05:08','2026-09-18 05:05:08'),
(322,'App\\Models\\User',5,'auth_token','778c6a83e7ad3eec8bfc3c8fcb1f851319c83b0afe7a30fe232003b5d9cfe7fd','[\"*\"]','2026-09-18 05:05:12',NULL,'2026-09-18 05:05:11','2026-09-18 05:05:12'),
(323,'App\\Models\\User',2,'auth_token','3333080d78624d5b9c5150bb91e97895e646dff4a79a5cc06cba9b6e8f94dbff','[\"*\"]','2026-09-18 05:05:15',NULL,'2026-09-18 05:05:14','2026-09-18 05:05:15'),
(324,'App\\Models\\User',1,'auth_token','620aa0a8552702dc0f25213e9cc9c5c5a6b08844189da22cf2843223accf3388','[\"*\"]','2026-09-18 05:07:06',NULL,'2026-09-18 05:07:04','2026-09-18 05:07:06'),
(325,'App\\Models\\User',3,'auth_token','c8871ba347ba7c9661f8619dd89fbf504f0eed74e3bd1bd6f868998f9b190cf4','[\"*\"]','2026-09-18 05:07:09',NULL,'2026-09-18 05:07:08','2026-09-18 05:07:09'),
(326,'App\\Models\\User',5,'auth_token','b8e333ca5074eac63740eb086c19cc754f5dea99f72d53b6c470d6ea23995927','[\"*\"]','2026-09-18 05:07:12',NULL,'2026-09-18 05:07:11','2026-09-18 05:07:12'),
(327,'App\\Models\\User',2,'auth_token','28fa6714903584478ee67d6f6311585c06c762c2625c007c3cb556c2b16b8f2c','[\"*\"]','2026-09-18 05:07:15',NULL,'2026-09-18 05:07:14','2026-09-18 05:07:15'),
(328,'App\\Models\\User',1,'auth_token','f59034e0efc7a6cd49fbb11d7dce2a20afa42a894a5c4b6050d8f14737925b25','[\"*\"]',NULL,NULL,'2026-09-18 05:24:34','2026-09-18 05:24:34'),
(329,'App\\Models\\User',1,'auth_token','9f7c9309701b553d7ce612dddde69bc36f6337df466c65a0c0adf49d2a21feb4','[\"*\"]',NULL,NULL,'2026-09-18 05:25:46','2026-09-18 05:25:46'),
(330,'App\\Models\\User',3,'auth_token','2bddf55658ecf7849b01e529709834a22d117af57bfff923a9b9f19834363924','[\"*\"]',NULL,NULL,'2026-09-18 05:25:49','2026-09-18 05:25:49'),
(331,'App\\Models\\User',5,'auth_token','f85d51e9c10ff7e2837a0fe0f02d8c39ddd0c061aa2182e40e8570f74cf41a12','[\"*\"]',NULL,NULL,'2026-09-18 05:25:51','2026-09-18 05:25:51'),
(332,'App\\Models\\User',27,'auth_token','d4f20d9bd2988a8265e20f2968e8bb55be65977b179d18688426ec0d331bde5f','[\"*\"]',NULL,NULL,'2026-09-18 05:39:49','2026-09-18 05:39:49'),
(333,'App\\Models\\User',28,'auth_token','fe6a7306c2f098f55ddd2ffaf4479e35466b68c6597fa6aa482ac3604dfac0ea','[\"*\"]','2026-09-18 05:46:05',NULL,'2026-09-18 05:46:03','2026-09-18 05:46:05'),
(335,'App\\Models\\User',1,'auth_token','6ae44a48726c4f778f47a506ff5e0459d6559dd46e39783f50c46c5beede702d','[\"*\"]',NULL,NULL,'2026-09-18 06:15:31','2026-09-18 06:15:31');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('residential','commercial','mixed') NOT NULL,
  `total_units` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `properties_owner_id_foreign` (`owner_id`),
  CONSTRAINT `properties_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES
(1,1,'Marina Tower','Marina Walk 1','Dubai','Waterfront','commercial',2,'2026-08-10 04:22:38','2026-09-10 09:45:55'),
(2,1,'JLT Heights','Cluster X','Dubai','Lake view','commercial',2,'2026-08-10 04:22:38','2026-09-10 12:10:18'),
(3,2,'Bay Office','BB Avenue','Dubai','Commercial','commercial',2,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(4,1,'flat','burjkhalifa','dubai',NULL,'residential',1,'2026-08-16 14:34:50','2026-08-16 14:41:46'),
(5,1,'Al Barsha Residence Tower','Al Barsha 1, Sheikh Zayed Road','Dubai',NULL,'residential',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(6,2,'DIFC Business Centre','Gate District 4, DIFC','Dubai',NULL,'commercial',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(7,3,'Jumeirah Living Suites','Jumeirah Beach Road, Jumeirah 1','Dubai',NULL,'residential',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(8,3,'Silicon Oasis Tech Park','Dubai Silicon Oasis, Phase 2','Dubai',NULL,'commercial',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(9,1,'Sports City Apartments','Dubai Sports City, Victory Heights','Dubai',NULL,'residential',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(10,1,'Emaar Downtown Residences','Downtown Boulevard, Plot 405','Dubai',NULL,'residential',20,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(11,1,'Emaar Downtown Residences','Downtown Boulevard, Plot 405','Dubai',NULL,'residential',20,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(12,1,'Emaar Downtown Residences','Downtown Boulevard, Plot 405','Dubai',NULL,'residential',20,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(15,4,'jat','5a','dubai',NULL,'commercial',1,'2026-08-25 08:04:58','2026-08-25 08:06:22'),
(16,7,'Burj Khalifa Staging Tower','Downtown Dubai, Sheikh Mohammed bin Rashid Blvd','Dubai',NULL,'residential',1,'2026-09-01 04:51:47','2026-09-01 04:51:47'),
(17,7,'Palm Jumeirah Crown Luxury','Crescent Rd, Palm Jumeirah, Dubai','Dubai',NULL,'residential',1,'2026-09-01 04:59:40','2026-09-01 04:59:40'),
(18,1,'E2E Luxury Towers','Business Bay Dubai','Dubai',NULL,'residential',0,'2026-09-03 05:20:28','2026-09-03 05:20:28'),
(19,1,'E2E Apex Tower 152800','Al Marsa St, Dubai Marina','Dubai','Premium E2E Test Waterfront Tower','residential',1,'2026-09-03 05:28:00','2026-09-03 05:28:00'),
(20,1,'E2E Apex Tower 153717','Al Marsa St, Dubai Marina','Dubai','Premium E2E Test Waterfront Tower','residential',1,'2026-09-03 05:37:17','2026-09-03 05:37:18'),
(21,1,'Marina Bay Heights 751','Dubai Marina, Al Marsa St','Dubai','Luxury waterfront residential building managed on GoFreeHold','residential',0,'2026-09-06 11:51:30','2026-09-06 11:51:30'),
(22,1,'Marina Bay Heights 776','Dubai Marina, Al Marsa St','Dubai','Luxury waterfront residential building managed on GoFreeHold','residential',2,'2026-09-06 11:52:16','2026-09-06 11:52:17'),
(23,5,'The Opus Executive Tower','Al A\'amal Street, Business Bay','Dubai',NULL,'residential',1,'2026-09-06 12:20:18','2026-09-10 12:22:41'),
(24,9,'Marina Tower','Marina gali','Dubai',NULL,'commercial',1,'2026-09-11 13:22:24','2026-09-11 13:23:07'),
(25,9,'E2E Royal Heights 060721','Al Marsa St, Dubai Marina','Dubai','Real-data E2E test building with automated verification','residential',2,'2026-09-18 01:07:21','2026-09-18 01:07:32'),
(26,9,'E2E Royal Heights 060931','Al Marsa St, Dubai Marina','Dubai','Real-data E2E test building with automated verification','residential',2,'2026-09-18 01:09:31','2026-09-18 01:09:34'),
(27,9,'E2E Royal Heights 061142','Al Marsa St, Dubai Marina','Dubai','Real-data E2E test building with automated verification','residential',2,'2026-09-18 01:11:42','2026-09-18 01:11:44'),
(28,1,'E2E Royal Heights 061357','Al Marsa St, Dubai Marina','Dubai','Real-data E2E test building with automated verification','residential',2,'2026-09-18 01:13:57','2026-09-18 01:14:00');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint(20) unsigned NOT NULL,
  `item_id` bigint(20) unsigned DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_items_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_items_item_id_index` (`item_id`),
  CONSTRAINT `purchase_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
INSERT INTO `purchase_items` VALUES
(1,1,1,'Split AC Filters',10,150.00,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,4,NULL,'LED Panel Light 60x60',40,45.00,'2026-09-03 05:28:15','2026-09-03 05:28:15'),
(3,4,NULL,'R-410A Refrigerant Gas Canister',5,320.00,'2026-09-03 05:28:15','2026-09-03 05:28:15'),
(4,5,NULL,'LED Panel Light 60x60',40,45.00,'2026-09-03 05:37:24','2026-09-03 05:37:24'),
(5,5,NULL,'R-410A Refrigerant Gas Canister',5,320.00,'2026-09-03 05:37:24','2026-09-03 05:37:24'),
(6,6,NULL,'Thermostat 240V',10,65.00,'2026-09-18 01:07:34','2026-09-18 01:07:34'),
(7,7,NULL,'Thermostat 240V',10,65.00,'2026-09-18 01:09:35','2026-09-18 01:09:35'),
(8,8,NULL,'Thermostat 240V',10,65.00,'2026-09-18 01:11:45','2026-09-18 01:11:45'),
(9,9,NULL,'Thermostat 240V',10,65.00,'2026-09-18 01:14:01','2026-09-18 01:14:01');
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `purchase_date` date DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES
(1,'Gulf Supplies','2026-08-10',1500.00,'received','Verification seed PO','2026-08-10 04:22:38','2026-08-21 11:23:50'),
(2,'Danube Home Trading LLC','2026-08-22',4500.00,'approved','AC Compressor and filters stock','2026-08-21 22:55:28','2026-08-21 22:55:28'),
(3,'Danube Home Trading LLC','2026-08-22',4500.00,'approved','AC Compressor and filters stock','2026-08-21 22:59:27','2026-08-21 22:59:27'),
(4,'Dubai Industrial Supplies LLC','2026-09-03',3400.00,'received','Quarterly hardware & consumable replenishments','2026-09-03 05:28:15','2026-09-03 05:28:16'),
(5,'Dubai Industrial Supplies LLC','2026-09-03',3400.00,'received','Quarterly hardware & consumable replenishments','2026-09-03 05:37:24','2026-09-03 05:37:24'),
(6,'Gulf Electrical Supplies Ltd','2026-09-18',650.00,'pending','Restock spare heating elements and valves','2026-09-18 01:07:34','2026-09-18 01:07:34'),
(7,'Gulf Electrical Supplies Ltd','2026-09-18',650.00,'pending','Restock spare heating elements and valves','2026-09-18 01:09:35','2026-09-18 01:09:35'),
(8,'Gulf Electrical Supplies Ltd','2026-09-18',650.00,'pending','Restock spare heating elements and valves','2026-09-18 01:11:45','2026-09-18 01:11:45'),
(9,'Gulf Electrical Supplies Ltd','2026-09-18',650.00,'pending','Restock spare heating elements and valves','2026-09-18 01:14:01','2026-09-18 01:14:01');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `queue_jobs`
--

DROP TABLE IF EXISTS `queue_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `queue_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `queue_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `queue_jobs` WRITE;
/*!40000 ALTER TABLE `queue_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `queue_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rent_transactions`
--

DROP TABLE IF EXISTS `rent_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rent_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `payment_id` bigint(20) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `debit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `deleted_by` bigint(20) unsigned DEFAULT NULL,
  `deletion_reason` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rent_transactions_contract_id_date_index` (`contract_id`,`date`),
  KEY `rent_transactions_payment_id_foreign` (`payment_id`),
  CONSTRAINT `rent_transactions_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rent_transactions_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rent_transactions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rent_transactions` WRITE;
/*!40000 ALTER TABLE `rent_transactions` DISABLE KEYS */;
INSERT INTO `rent_transactions` VALUES
(1,1,NULL,'2026-08-01','Rent due 2026-08',55000.00,0.00,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,1,NULL,'2026-08-10','Partial rent payment',0.00,20000.00,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(3,2,NULL,'2026-08-01','Rent due 2026-08',80000.00,0.00,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(4,2,239,'2026-08-18','RENT payment',0.00,7500.00,NULL,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51'),
(5,2,240,'2026-08-18','DEWA payment',0.00,620.50,NULL,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51'),
(6,2,241,'2026-08-18','DEPOSIT payment',0.00,5000.00,NULL,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51'),
(7,2,242,'2026-08-18','RENT payment',0.00,7500.00,NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(8,2,243,'2026-08-18','DEWA payment',0.00,620.50,NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(9,2,244,'2026-08-18','DEPOSIT payment',0.00,5000.00,NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(10,2,247,'2026-08-21','DEWA payment',0.00,80000.00,NULL,NULL,NULL,'2026-08-21 11:31:49','2026-08-21 11:31:49'),
(11,11,NULL,'2026-09-01','Rent due 2026-09',60000.00,0.00,NULL,NULL,NULL,'2026-08-21 11:53:59','2026-08-21 11:53:59'),
(12,12,NULL,'2026-10-01','Rent due 2026-10',120000.00,0.00,NULL,NULL,NULL,'2026-08-21 11:53:59','2026-08-21 11:53:59'),
(13,13,NULL,'2026-11-01','Rent due 2026-11',36000.00,0.00,NULL,NULL,NULL,'2026-08-21 11:53:59','2026-08-21 11:53:59'),
(14,4,NULL,'2026-08-01','Rent due 2026-08',130000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(16,6,NULL,'2026-08-01','Rent due 2026-08',130000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(17,7,NULL,'2026-08-01','Rent due 2026-08',220000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(18,9,NULL,'2026-08-01','Rent due 2026-08',140000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(19,10,NULL,'2026-08-01','Rent due 2026-08',55000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(20,11,NULL,'2026-08-01','Rent due 2026-08',60000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(21,12,NULL,'2026-08-01','Rent due 2026-08',120000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(22,13,NULL,'2026-08-01','Rent due 2026-08',36000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(23,18,NULL,'2026-09-01','Rent due 2026-09',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(24,18,251,'2026-09-01','Payment received (CHQ-501101)',0.00,23750.00,NULL,NULL,NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(25,18,NULL,'2026-08-01','Rent due 2026-08',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:54:32','2026-08-21 22:54:32'),
(26,20,NULL,'2026-09-01','Rent due 2026-09',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(27,20,252,'2026-09-01','Payment received (CHQ-501101)',0.00,23750.00,NULL,NULL,NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(28,20,NULL,'2026-08-01','Rent due 2026-08',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:55:29','2026-08-21 22:55:29'),
(29,22,NULL,'2026-09-01','Rent due 2026-09',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(30,22,253,'2026-09-01','Payment received (CHQ-501101)',0.00,23750.00,NULL,NULL,NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(31,22,NULL,'2026-08-01','Rent due 2026-08',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(32,24,NULL,'2026-08-01','Rent due 2026-08',20000.00,0.00,NULL,NULL,NULL,'2026-08-21 23:30:19','2026-08-21 23:30:19'),
(33,25,NULL,'2026-08-01','Rent due 2026-08',4000.00,0.00,NULL,NULL,NULL,'2026-08-25 08:10:26','2026-08-25 08:10:26'),
(35,2,NULL,'2026-09-01','Rent due 2026-09',80000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(36,4,NULL,'2026-09-01','Rent due 2026-09',130000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(38,6,NULL,'2026-09-01','Rent due 2026-09',130000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(39,7,NULL,'2026-09-01','Rent due 2026-09',220000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(40,9,NULL,'2026-09-01','Rent due 2026-09',140000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(41,10,NULL,'2026-09-01','Rent due 2026-09',55000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(42,12,NULL,'2026-09-01','Rent due 2026-09',120000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(43,13,NULL,'2026-09-01','Rent due 2026-09',36000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(44,24,NULL,'2026-09-01','Rent due 2026-09',20000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(45,25,NULL,'2026-09-01','Rent due 2026-09',4000.00,0.00,NULL,NULL,NULL,'2026-09-02 11:43:59','2026-09-02 11:43:59'),
(47,26,NULL,'2026-09-01','Rent due 2026-09',450000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:28:09','2026-09-03 05:28:09'),
(48,26,254,'2026-09-03','RENT payment ref TXN-152808',0.00,25000.00,1,'Cancelled by administrator','2026-09-11 11:55:44','2026-09-03 05:28:09','2026-09-11 11:55:44'),
(50,5,NULL,'2025-01-01','Rent due 2025-01',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(51,5,NULL,'2025-02-01','Rent due 2025-02',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(52,5,NULL,'2025-03-01','Rent due 2025-03',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(53,5,NULL,'2025-04-01','Rent due 2025-04',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(54,5,NULL,'2025-05-01','Rent due 2025-05',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(55,5,NULL,'2025-06-01','Rent due 2025-06',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(56,5,NULL,'2025-07-01','Rent due 2025-07',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(57,5,NULL,'2025-08-01','Rent due 2025-08',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(58,5,NULL,'2025-09-01','Rent due 2025-09',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(59,5,NULL,'2025-10-01','Rent due 2025-10',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(60,5,NULL,'2025-11-01','Rent due 2025-11',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(61,5,NULL,'2025-12-01','Rent due 2025-12',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(62,5,NULL,'2026-01-01','Rent due 2026-01',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(63,5,NULL,'2026-02-01','Rent due 2026-02',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(64,5,NULL,'2026-03-01','Rent due 2026-03',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(65,5,NULL,'2026-04-01','Rent due 2026-04',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(66,5,NULL,'2026-05-01','Rent due 2026-05',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(67,5,NULL,'2026-06-01','Rent due 2026-06',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(68,5,NULL,'2026-07-01','Rent due 2026-07',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(69,5,NULL,'2026-08-01','Rent due 2026-08',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(70,5,NULL,'2026-09-01','Rent due 2026-09',85000.00,0.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(71,5,126,'2025-01-01','DEPOSIT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(72,5,127,'2025-01-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(73,5,139,'2025-01-01','DEWA payment',0.00,539.05,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(74,5,128,'2025-02-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(75,5,140,'2025-02-01','DEWA payment',0.00,592.43,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(76,5,129,'2025-03-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(77,5,141,'2025-03-01','DEWA payment',0.00,432.53,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(78,5,130,'2025-04-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(79,5,142,'2025-04-01','DEWA payment',0.00,482.79,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(80,5,131,'2025-05-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(81,5,143,'2025-05-01','DEWA payment',0.00,384.36,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(82,5,132,'2025-06-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(83,5,144,'2025-06-01','DEWA payment',0.00,597.80,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(84,5,133,'2025-07-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(85,5,134,'2025-08-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(86,5,135,'2025-09-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(87,5,136,'2025-10-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(88,5,137,'2025-11-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(89,5,138,'2025-12-01','RENT payment',0.00,7083.33,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(90,5,255,'2026-09-03','RENT payment ref TXN-153720',0.00,25000.00,NULL,NULL,NULL,'2026-09-03 05:37:20','2026-09-03 05:37:20'),
(91,13,256,'2026-09-06','RENT payment',0.00,36000.00,NULL,NULL,NULL,'2026-09-06 11:51:25','2026-09-06 11:51:25'),
(92,13,257,'2026-09-06','DEWA payment',0.00,40000.00,NULL,NULL,NULL,'2026-09-06 11:51:57','2026-09-06 11:51:57'),
(93,27,NULL,'2026-09-01','Rent due 2026-09',130000.00,0.00,NULL,NULL,NULL,'2026-09-06 11:52:17','2026-09-06 11:52:17'),
(94,28,NULL,'2026-09-01','Rent due 2026-09',40000.00,0.00,NULL,NULL,NULL,'2026-09-06 12:25:15','2026-09-06 12:25:15'),
(95,28,258,'2026-09-07','RENT payment',0.00,40000.00,1,'Cancelled by administrator','2026-09-07 04:58:49','2026-09-07 03:29:39','2026-09-07 04:58:49'),
(96,28,259,'2026-09-07','RENT payment',0.00,50000.00,1,'Cancelled by administrator','2026-09-07 04:59:02','2026-09-07 03:30:38','2026-09-07 04:59:02'),
(97,26,260,'2026-09-07','DEWA payment',0.00,30000.00,NULL,NULL,NULL,'2026-09-07 04:14:14','2026-09-07 04:14:14'),
(98,26,261,'2026-09-07','DEWA payment',0.00,3000.00,NULL,NULL,NULL,'2026-09-07 04:15:12','2026-09-07 04:15:12'),
(99,28,262,'2026-09-07','RENT payment',0.00,20000.00,1,'Cancelled by administrator','2026-09-07 04:55:25','2026-09-07 04:46:16','2026-09-07 04:55:25'),
(100,28,263,'2026-09-07','RENT payment',0.00,40000.00,1,'Cancelled by administrator','2026-09-07 05:05:52','2026-09-07 05:05:27','2026-09-07 05:05:52'),
(101,28,264,'2026-07-25','RENT payment',0.00,2300.00,1,'Deleted by administrator','2026-09-07 05:23:47','2026-09-07 05:13:26','2026-09-07 05:23:47'),
(102,28,265,'2026-08-28','RENT payment',0.00,2300.00,1,'Cancelled by administrator','2026-09-07 05:13:42','2026-09-07 05:13:26','2026-09-07 05:13:42'),
(103,28,266,'2026-09-27','RENT payment',0.00,2500.00,1,'Cancelled by administrator','2026-09-07 05:29:04','2026-09-07 05:14:00','2026-09-07 05:29:04'),
(104,28,267,'2026-10-25','RENT payment',0.00,2500.00,1,'Cancelled by administrator','2026-09-07 05:29:07','2026-09-07 05:14:00','2026-09-07 05:29:07'),
(105,28,268,'2026-09-07','RENT payment',0.00,40000.00,1,'Cancelled by administrator','2026-09-07 05:29:01','2026-09-07 05:15:23','2026-09-07 05:29:01'),
(106,24,269,'2026-09-07','RENT payment',0.00,20000.00,1,'Cancelled by administrator','2026-09-07 05:25:14','2026-09-07 05:21:40','2026-09-07 05:25:14'),
(107,24,270,'2026-09-07','DEWA payment',0.00,1000.00,1,'Cancelled by administrator','2026-09-07 05:26:04','2026-09-07 05:26:00','2026-09-07 05:26:04'),
(108,29,NULL,'2026-09-01','Rent due 2026-09',50000.00,0.00,NULL,NULL,NULL,'2026-09-11 13:25:47','2026-09-11 13:25:47'),
(109,1,271,'2026-09-16','RENT payment',0.00,100.00,NULL,NULL,NULL,'2026-09-16 02:27:44','2026-09-16 02:27:44'),
(110,30,NULL,'2026-09-01','Rent due 2026-09',90000.00,0.00,NULL,NULL,NULL,'2026-09-18 01:07:22','2026-09-18 01:07:22'),
(111,30,272,'2026-09-18','RENT payment ref E2E-TRX-060721',0.00,22500.00,NULL,NULL,NULL,'2026-09-18 01:07:30','2026-09-18 01:07:30'),
(112,31,NULL,'2026-09-01','Rent due 2026-09',90000.00,0.00,NULL,NULL,NULL,'2026-09-18 01:09:32','2026-09-18 01:09:32'),
(113,31,273,'2026-09-18','RENT payment ref E2E-TRX-060931',0.00,22500.00,NULL,NULL,NULL,'2026-09-18 01:09:33','2026-09-18 01:09:33'),
(114,32,NULL,'2026-09-01','Rent due 2026-09',90000.00,0.00,NULL,NULL,NULL,'2026-09-18 01:11:43','2026-09-18 01:11:43'),
(115,32,274,'2026-09-18','RENT payment ref E2E-TRX-061142',0.00,22500.00,NULL,NULL,NULL,'2026-09-18 01:11:44','2026-09-18 01:11:44'),
(116,33,NULL,'2026-09-01','Rent due 2026-09',90000.00,0.00,NULL,NULL,NULL,'2026-09-18 01:13:58','2026-09-18 01:13:58'),
(117,33,275,'2026-09-18','RENT payment ref E2E-TRX-061357',0.00,22500.00,NULL,NULL,NULL,'2026-09-18 01:13:59','2026-09-18 01:13:59');
/*!40000 ALTER TABLE `rent_transactions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `service_charge_payments`
--

DROP TABLE IF EXISTS `service_charge_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_charge_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_charge_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_charge_payments_service_charge_id_foreign` (`service_charge_id`),
  CONSTRAINT `service_charge_payments_service_charge_id_foreign` FOREIGN KEY (`service_charge_id`) REFERENCES `service_charges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_charge_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `service_charge_payments` WRITE;
/*!40000 ALTER TABLE `service_charge_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_charge_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `service_charges`
--

DROP TABLE IF EXISTS `service_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_charges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `unit_id` bigint(20) unsigned NOT NULL,
  `charge_type` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('pending','paid','waived') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_charges_contract_id_foreign` (`contract_id`),
  KEY `service_charges_unit_id_foreign` (`unit_id`),
  CONSTRAINT `service_charges_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_charges_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_charges`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `service_charges` WRITE;
/*!40000 ALTER TABLE `service_charges` DISABLE KEYS */;
INSERT INTO `service_charges` VALUES
(1,1,1,'maintenance',500.00,'2026-08-25',NULL,'pending',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,11,1,'maintenance',250.00,'2026-09-04',NULL,'pending','Deep test elevator charge','2026-08-21 12:22:07','2026-08-21 12:22:07'),
(3,11,1,'maintenance',250.00,'2026-09-04',NULL,'pending','Deep test elevator charge','2026-08-21 12:27:58','2026-08-21 12:27:58'),
(4,11,1,'maintenance',250.00,'2026-09-04',NULL,'pending','Deep test elevator charge','2026-08-21 12:28:55','2026-08-21 12:28:55'),
(5,18,20,'chiller_ac',1200.00,'2026-09-15',NULL,'waived','Q3 Empower/District Cooling charges','2026-08-21 22:54:31','2026-08-21 22:58:26'),
(6,20,22,'chiller_ac',1200.00,'2026-09-15',NULL,'pending','Q3 Empower/District Cooling charges','2026-08-21 22:55:28','2026-08-21 22:55:28'),
(7,22,24,'chiller_ac',1200.00,'2026-09-15',NULL,'pending','Q3 Empower/District Cooling charges','2026-08-21 22:59:27','2026-08-21 22:59:27'),
(8,26,28,'maintenance',1500.00,'2026-09-15',NULL,'pending','Annual AC duct cleaning and deep sanitize','2026-09-03 05:28:09','2026-09-03 05:28:09'),
(9,5,9,'maintenance',1500.00,'2026-09-15',NULL,'pending','Annual AC duct cleaning and deep sanitize','2026-09-03 05:37:20','2026-09-03 05:37:20'),
(10,31,37,'maintenance',750.00,'2026-10-03',NULL,'pending','Annual AC filter and duct disinfection fee','2026-09-18 01:09:34','2026-09-18 01:09:34'),
(11,32,39,'maintenance',750.00,'2026-10-03',NULL,'pending','Annual AC filter and duct disinfection fee','2026-09-18 01:11:44','2026-09-18 01:11:44'),
(12,33,41,'maintenance',750.00,'2026-10-03',NULL,'pending','Annual AC filter and duct disinfection fee','2026-09-18 01:13:59','2026-09-18 01:13:59');
/*!40000 ALTER TABLE `service_charges` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settlement_docs`
--

DROP TABLE IF EXISTS `settlement_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlement_docs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `settlement_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlement_docs_settlement_id_foreign` (`settlement_id`),
  CONSTRAINT `settlement_docs_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlement_docs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settlement_docs` WRITE;
/*!40000 ALTER TABLE `settlement_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `settlement_docs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settlement_payments`
--

DROP TABLE IF EXISTS `settlement_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlement_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `settlement_id` bigint(20) unsigned NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlement_payments_settlement_id_foreign` (`settlement_id`),
  CONSTRAINT `settlement_payments_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlement_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settlement_payments` WRITE;
/*!40000 ALTER TABLE `settlement_payments` DISABLE KEYS */;
INSERT INTO `settlement_payments` VALUES
(1,5,'cheque',1000.00,'2026-09-03','2026-09-03 05:37:21','2026-09-03 05:37:21');
/*!40000 ALTER TABLE `settlement_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settlements`
--

DROP TABLE IF EXISTS `settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint(20) unsigned DEFAULT NULL,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `vacant_date` date DEFAULT NULL,
  `dues` decimal(12,2) NOT NULL DEFAULT 0.00,
  `receivable` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  `on_case` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlements_owner_id_foreign` (`owner_id`),
  KEY `settlements_contract_id_foreign` (`contract_id`),
  CONSTRAINT `settlements_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `settlements_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settlements` WRITE;
/*!40000 ALTER TABLE `settlements` DISABLE KEYS */;
INSERT INTO `settlements` VALUES
(1,1,NULL,'2026-08-10',5000.00,2000.00,'pending',0,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,NULL,19,NULL,0.00,0.00,'completed',0,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(3,NULL,21,NULL,0.00,0.00,'completed',0,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(4,NULL,23,NULL,0.00,0.00,'completed',0,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(5,1,2,'2026-09-30',3500.00,2000.00,'pending',0,'2026-09-03 05:37:21','2026-09-03 05:37:21');
/*!40000 ALTER TABLE `settlements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staff_access_audits`
--

DROP TABLE IF EXISTS `staff_access_audits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_access_audits` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint(20) unsigned NOT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `action` varchar(80) NOT NULL,
  `target_id` bigint(20) unsigned NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_access_audits_actor_id_foreign` (`actor_id`),
  KEY `staff_access_audits_owner_id_foreign` (`owner_id`),
  CONSTRAINT `staff_access_audits_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `staff_access_audits_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_access_audits`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staff_access_audits` WRITE;
/*!40000 ALTER TABLE `staff_access_audits` DISABLE KEYS */;
INSERT INTO `staff_access_audits` VALUES
(1,2,1,'job.updated',14,'{\"status\":\"in_progress\",\"assigned_to\":2}','2026-09-13 13:07:41','2026-09-13 13:07:41'),
(2,3,1,'staff.created',21,'{\"role\":\"cashier\"}','2026-09-16 02:03:54','2026-09-16 02:03:54'),
(3,3,1,'staff.invited',21,'[]','2026-09-16 02:03:54','2026-09-16 02:03:54'),
(4,3,1,'staff.disabled',21,'{\"reason\":\"nothing i want\"}','2026-09-16 02:23:46','2026-09-16 02:23:46'),
(5,3,1,'staff.enabled',21,'{\"reason\":null}','2026-09-16 02:25:40','2026-09-16 02:25:40'),
(6,21,1,'payment.created',271,'{\"contract_id\":1,\"amount\":\"100.00\"}','2026-09-16 02:27:44','2026-09-16 02:27:44'),
(7,3,1,'staff.disabled',21,'{\"reason\":\"nothing i want\"}','2026-09-16 02:46:28','2026-09-16 02:46:28'),
(8,3,1,'staff.enabled',21,'{\"reason\":null}','2026-09-16 02:49:14','2026-09-16 02:49:14'),
(9,3,1,'staff.disabled',22,'{\"reason\":\"i wanna\"}','2026-09-16 02:50:58','2026-09-16 02:50:58'),
(10,3,1,'staff.enabled',22,'{\"reason\":null}','2026-09-16 02:51:37','2026-09-16 02:51:37'),
(11,2,1,'job.updated',14,'{\"status\":\"in_progress\",\"assigned_to\":2}','2026-09-16 03:50:59','2026-09-16 03:50:59'),
(12,2,1,'job.updated',14,'{\"status\":\"completed\",\"assigned_to\":2}','2026-09-16 03:51:16','2026-09-16 03:51:16'),
(13,23,2,'job.updated',15,'{\"status\":\"in_progress\",\"assigned_to\":23}','2026-09-16 04:04:30','2026-09-16 04:04:30'),
(14,23,2,'job.updated',15,'{\"status\":\"in_progress\",\"assigned_to\":23}','2026-09-16 04:06:56','2026-09-16 04:06:56'),
(15,23,2,'job.updated',15,'{\"status\":\"completed\",\"assigned_to\":23}','2026-09-16 04:07:33','2026-09-16 04:07:33'),
(16,3,1,'staff.created',24,'{\"role\":\"cashier\"}','2026-09-16 08:32:03','2026-09-16 08:32:03'),
(17,3,1,'staff.invited',24,'[]','2026-09-16 08:32:03','2026-09-16 08:32:03'),
(18,3,1,'staff.invited',24,'[]','2026-09-16 09:26:58','2026-09-16 09:26:58'),
(19,1,1,'job.assigned',16,'{\"assigned_to\":2}','2026-09-16 09:56:29','2026-09-16 09:56:29'),
(20,3,1,'staff.created',25,'{\"role\":\"accountant\"}','2026-09-16 11:06:37','2026-09-16 11:06:37'),
(21,3,1,'staff.invited',25,'[]','2026-09-16 11:06:37','2026-09-16 11:06:37'),
(22,25,1,'staff.activated',25,'[]','2026-09-16 11:07:11','2026-09-16 11:07:11'),
(23,1,1,'job.assigned',1,'{\"assigned_to\":2}','2026-09-18 01:07:33','2026-09-18 01:07:33'),
(24,2,1,'job.updated',1,'{\"status\":\"in_progress\",\"assigned_to\":2}','2026-09-18 01:07:33','2026-09-18 01:07:33'),
(25,2,1,'job.updated',1,'{\"status\":\"completed\",\"assigned_to\":2}','2026-09-18 01:07:33','2026-09-18 01:07:33'),
(26,1,1,'job.assigned',1,'{\"assigned_to\":2}','2026-09-18 01:09:34','2026-09-18 01:09:34'),
(27,2,1,'job.updated',1,'{\"status\":\"in_progress\",\"assigned_to\":2}','2026-09-18 01:09:35','2026-09-18 01:09:35'),
(28,2,1,'job.updated',1,'{\"status\":\"completed\",\"assigned_to\":2}','2026-09-18 01:09:35','2026-09-18 01:09:35'),
(29,1,1,'job.assigned',17,'{\"assigned_to\":2}','2026-09-18 01:14:00','2026-09-18 01:14:00'),
(30,2,1,'job.updated',17,'{\"status\":\"in_progress\",\"assigned_to\":2}','2026-09-18 01:14:00','2026-09-18 01:14:00'),
(31,2,1,'job.updated',17,'{\"status\":\"completed\",\"assigned_to\":2}','2026-09-18 01:14:01','2026-09-18 01:14:01');
/*!40000 ALTER TABLE `staff_access_audits` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staff_invitations`
--

DROP TABLE IF EXISTS `staff_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_invitations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_staff_id` bigint(20) unsigned NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `delivery_status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_invitations_token_hash_unique` (`token_hash`),
  KEY `staff_invitations_owner_staff_id_foreign` (`owner_staff_id`),
  KEY `staff_invitations_created_by_foreign` (`created_by`),
  CONSTRAINT `staff_invitations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `staff_invitations_owner_staff_id_foreign` FOREIGN KEY (`owner_staff_id`) REFERENCES `owner_staff` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_invitations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staff_invitations` WRITE;
/*!40000 ALTER TABLE `staff_invitations` DISABLE KEYS */;
INSERT INTO `staff_invitations` VALUES
(1,2,'1486860c0a4cb36bc1469c2f00a71969901c67e3bd3ecfbc345e7219a2cd4ecb','2026-09-17 02:03:54','2026-09-16 07:11:04',NULL,'sent',3,'2026-09-16 02:03:54','2026-09-16 02:04:10'),
(2,5,'40207ddcac546498b92e3b2b94cb46d2ad69c01284711a93b83c77c3a5eb6ee9','2026-09-17 08:32:03',NULL,'2026-09-16 09:26:58','sent',3,'2026-09-16 08:32:03','2026-09-16 09:26:58'),
(3,5,'d02a6e6c55d834efeac0c65948aff870897e515bf93e6735ea2030850cc3b777','2026-09-17 09:26:58',NULL,NULL,'sent',3,'2026-09-16 09:26:58','2026-09-16 09:27:01'),
(4,6,'138f4e7756d243ee2c308792ba5d8d0aef5476c6c8d9082a7013d2e010d51958','2026-09-17 11:06:37','2026-09-16 11:07:11',NULL,'sent',3,'2026-09-16 11:06:37','2026-09-16 11:07:11');
/*!40000 ALTER TABLE `staff_invitations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staff_payment_requests`
--

DROP TABLE IF EXISTS `staff_payment_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_payment_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint(20) unsigned NOT NULL,
  `request_key` varchar(64) NOT NULL,
  `payload_hash` varchar(64) NOT NULL,
  `payment_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_payment_requests_actor_id_request_key_unique` (`actor_id`,`request_key`),
  KEY `staff_payment_requests_payment_id_foreign` (`payment_id`),
  CONSTRAINT `staff_payment_requests_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `staff_payment_requests_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_payment_requests`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staff_payment_requests` WRITE;
/*!40000 ALTER TABLE `staff_payment_requests` DISABLE KEYS */;
INSERT INTO `staff_payment_requests` VALUES
(1,21,'89ec9799-964e-45cd-b518-3aad538a0506','aa598707010fe65159fbd54d8610b835ec9176b200635dacadadfeb4e9feb0bf',271,'2026-09-16 02:27:44','2026-09-16 02:27:44');
/*!40000 ALTER TABLE `staff_payment_requests` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES
(1,'Alpha Team','0509999999','Primary','2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,'Alpha HVAC Rapid Response Team','+971-4-9988776','Specialized in VRF & Chiller Maintenance','2026-09-03 05:28:11','2026-09-03 05:28:11'),
(3,'Alpha HVAC Rapid Response Team','+971-4-9988776','Specialized in VRF & Chiller Maintenance','2026-09-03 05:37:22','2026-09-03 05:37:22'),
(4,'Precision MEP Squad 060721','0501234567','HVAC & Electrical rapid response team','2026-09-18 01:07:33','2026-09-18 01:07:33'),
(5,'Precision MEP Squad 060931','0501234567','HVAC & Electrical rapid response team','2026-09-18 01:09:34','2026-09-18 01:09:34'),
(6,'Precision MEP Squad 061142','0501234567','HVAC & Electrical rapid response team','2026-09-18 01:11:45','2026-09-18 01:11:45'),
(7,'Precision MEP Squad 061357','0501234567','HVAC & Electrical rapid response team','2026-09-18 01:14:00','2026-09-18 01:14:00');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tenancy_contracts`
--

DROP TABLE IF EXISTS `tenancy_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenancy_contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `c1` text DEFAULT NULL,
  `c2` text DEFAULT NULL,
  `c3` text DEFAULT NULL,
  `c4` text DEFAULT NULL,
  `c5` text DEFAULT NULL,
  `c6` text DEFAULT NULL,
  `c7` text DEFAULT NULL,
  `c8` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenancy_contracts_contract_id_foreign` (`contract_id`),
  CONSTRAINT `tenancy_contracts_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenancy_contracts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tenancy_contracts` WRITE;
/*!40000 ALTER TABLE `tenancy_contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenancy_contracts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tenancy_res`
--

DROP TABLE IF EXISTS `tenancy_res`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenancy_res` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `lessor_name` varchar(255) DEFAULT NULL,
  `lessor_emirates_id` varchar(255) DEFAULT NULL,
  `lessor_license_no` varchar(255) DEFAULT NULL,
  `lessor_email` varchar(255) DEFAULT NULL,
  `lessor_phone` varchar(255) DEFAULT NULL,
  `tenant_name` varchar(255) DEFAULT NULL,
  `tenant_emirates_id` varchar(255) DEFAULT NULL,
  `tenant_license_no` varchar(255) DEFAULT NULL,
  `tenant_email` varchar(255) DEFAULT NULL,
  `tenant_phone` varchar(255) DEFAULT NULL,
  `plot_no` varchar(255) DEFAULT NULL,
  `property_name` varchar(255) DEFAULT NULL,
  `property_usage` varchar(255) DEFAULT NULL,
  `property_area` varchar(255) DEFAULT NULL,
  `premises_no` varchar(255) DEFAULT NULL,
  `property_type` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `annual_rent` decimal(12,2) DEFAULT NULL,
  `period_from` date DEFAULT NULL,
  `period_to` date DEFAULT NULL,
  `security_deposit` decimal(12,2) DEFAULT NULL,
  `mode_of_payment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenancy_res_contract_id_foreign` (`contract_id`),
  CONSTRAINT `tenancy_res_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenancy_res`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tenancy_res` WRITE;
/*!40000 ALTER TABLE `tenancy_res` DISABLE KEYS */;
INSERT INTO `tenancy_res` VALUES
(1,26,'Sheikh Mohammed Real Estate LLC',NULL,NULL,NULL,NULL,NULL,'Hamdan Al Maktoum',NULL,NULL,NULL,NULL,NULL,'E2E Luxury Tower',NULL,NULL,NULL,NULL,NULL,120000.00,'2026-09-01','2027-08-31',6000.00,'4 Cheques','2026-09-03 05:28:07','2026-09-03 05:28:07'),
(2,5,'Sheikh Mohammed Real Estate LLC',NULL,NULL,NULL,NULL,NULL,'Hamdan Al Maktoum',NULL,NULL,NULL,NULL,NULL,'E2E Luxury Tower',NULL,NULL,NULL,NULL,NULL,120000.00,'2026-09-01','2027-08-31',6000.00,'4 Cheques','2026-09-03 05:37:19','2026-09-03 05:37:19');
/*!40000 ALTER TABLE `tenancy_res` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `emirates_id` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `passport_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenants_user_id_foreign` (`user_id`),
  CONSTRAINT `tenants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES
(1,5,NULL,'0503333336',NULL,NULL,'2026-08-10 04:22:38','2026-09-07 04:27:11','Tenant One','tenant@gofreehold.com','Dubai Marina','0503333336'),
(2,6,NULL,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38','Tenant Two','tenant2@gofreehold.com','JLT','0504444444'),
(3,7,NULL,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38','Tenant Three','tenant3@gofreehold.com','Business Bay','0505555555'),
(4,5,NULL,'',NULL,NULL,'2026-08-17 03:02:21','2026-08-17 03:02:21','Tenant One','tenant1@gofreehold.com',NULL,NULL),
(5,14,'784-1990-1234567-1','+971551001001','UAE','A12345678','2026-08-17 07:54:17','2026-08-17 07:54:17','Ahmed Hassan Al Farsi','a.farsi@gfh.com',NULL,'+971551001001'),
(6,15,'784-1988-7654321-2','+971551001002','Pakistani','PK8765432','2026-08-17 07:54:18','2026-08-17 07:54:18','Samira Binte Malik','s.malik@gfh.com',NULL,'+971551001002'),
(7,16,'784-1992-1122334-3','+971551001003','Indian','N5432198','2026-08-17 07:54:20','2026-08-17 07:54:20','Raj Kumar Patel','r.patel@gfh.com',NULL,'+971551001003'),
(8,17,'784-1985-9988776-4','+971551001004','Spanish','XDA123456','2026-08-17 07:54:21','2026-08-17 07:54:21','Elena Vasquez Torres','e.torres@gfh.com',NULL,'+971551001004'),
(9,18,'784-1991-4455667-5','+971551001005','Ghanaian','G0234567','2026-08-17 07:54:22','2026-08-17 07:54:22','James Kwame Osei','j.osei@gfh.com',NULL,'+971551001005'),
(10,19,'784-1980-9988776-1','+971501122334','Emirati','DXB-998811','2026-09-01 04:59:41','2026-09-11 11:56:01','Sheikh Rashid Al Maktoum','rashid.sheikh@dubai.gov.ae','Palm Jumeirah Villa 702, Dubai','+971501122334'),
(11,NULL,'784-2000-0000000-0','+923123632197','UAE','TEST123456','2026-09-11 03:52:48','2026-09-11 03:52:48','Fiza Nazz','Fizanaazz321@gmail.com','karachi pakistan','+923123632197');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `terms`
--

DROP TABLE IF EXISTS `terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `terms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cid` bigint(20) unsigned NOT NULL,
  `terms` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `terms_cid_foreign` (`cid`),
  CONSTRAINT `terms_cid_foreign` FOREIGN KEY (`cid`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `terms`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
INSERT INTO `terms` VALUES
(1,26,'1. Tenant shall maintain premises in clean condition. 2. Subleasing prohibited without prior landlord consent.','2026-09-03 05:28:07','2026-09-03 05:28:07'),
(2,5,'1. Tenant shall maintain premises in clean condition. 2. Subleasing prohibited without prior landlord consent.','2026-09-03 05:37:19','2026-09-03 05:37:19');
/*!40000 ALTER TABLE `terms` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `unit_items`
--

DROP TABLE IF EXISTS `unit_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `item_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `serial` varchar(255) DEFAULT NULL,
  `warranty` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `unit_items_unit_id_foreign` (`unit_id`),
  KEY `unit_items_item_id_foreign` (`item_id`),
  CONSTRAINT `unit_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `unit_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `unit_items` WRITE;
/*!40000 ALTER TABLE `unit_items` DISABLE KEYS */;
INSERT INTO `unit_items` VALUES
(1,1,1,1,'SN-AC-1',NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,1,1,1,'TEST-SN-001',NULL,'Deep test item',NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07'),
(3,1,1,1,'TEST-SN-001',NULL,'Deep test item',NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58'),
(4,1,1,1,'TEST-SN-001',NULL,'Deep test item',NULL,'2026-08-21 12:28:56','2026-08-21 12:28:56'),
(5,20,1,1,'SN-BOSCH-COOKER-901',NULL,'Bosch 4-Burner Gas Cooker',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(6,22,1,1,'SN-BOSCH-COOKER-901',NULL,'Bosch 4-Burner Gas Cooker',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(7,24,1,1,'SN-BOSCH-COOKER-901',NULL,'Bosch 4-Burner Gas Cooker',NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `unit_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `number` varchar(255) NOT NULL,
  `dhewa_no` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `floor` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `size` decimal(12,2) DEFAULT NULL,
  `furnished` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('AVAILABLE','BOOKED','OCCUPIED','SOLD') NOT NULL DEFAULT 'AVAILABLE',
  `price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `units_property_id_foreign` (`property_id`),
  KEY `units_owner_id_foreign` (`owner_id`),
  CONSTRAINT `units_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `units_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES
(1,1,1,'101',NULL,NULL,1,'1BR',750.00,1,'OCCUPIED',55000.00,'2026-08-10 04:22:38','2026-08-21 11:53:59'),
(2,1,1,'102',NULL,NULL,1,'studio',450.00,0,'AVAILABLE',40000.00,'2026-08-10 04:22:38','2026-09-04 13:29:22'),
(3,2,1,'201',NULL,NULL,2,'2BR',1100.00,1,'AVAILABLE',80000.00,'2026-08-10 04:22:38','2026-09-06 11:52:46'),
(4,2,1,'202',NULL,NULL,2,'1BR',800.00,1,'BOOKED',60000.00,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(5,3,2,'A1',NULL,NULL,5,'office',1200.00,0,'OCCUPIED',120000.00,'2026-08-10 04:22:38','2026-08-21 23:30:19'),
(6,3,2,'A2',NULL,NULL,5,'office',900.00,0,'SOLD',95000.00,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(7,4,1,'1001',NULL,NULL,1,'apartment',120.00,0,'AVAILABLE',2000.00,'2026-08-16 14:41:46','2026-08-21 12:28:55'),
(8,5,1,'501',NULL,'apartment',5,'1BR',750.00,0,'AVAILABLE',60000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(9,5,1,'502',NULL,'apartment',5,'2BR',1100.00,0,'OCCUPIED',85000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(10,5,1,'1001',NULL,'apartment',10,'3BR',1800.00,0,'OCCUPIED',130000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(11,5,1,'1501',NULL,'apartment',15,'studio',450.00,0,'AVAILABLE',42000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(12,6,2,'B101',NULL,'apartment',1,'office',2500.00,0,'OCCUPIED',220000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(13,6,2,'B202',NULL,'apartment',2,'office',1800.00,0,'AVAILABLE',170000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(14,7,3,'J01',NULL,'apartment',1,'1BR',900.00,0,'OCCUPIED',95000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(15,7,3,'J02',NULL,'apartment',1,'2BR',1400.00,0,'OCCUPIED',140000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(16,7,3,'J03',NULL,'apartment',8,'penthouse',3200.00,0,'AVAILABLE',320000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(17,8,3,'SO-A1',NULL,'apartment',1,'office',3000.00,0,'OCCUPIED',180000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(18,9,1,'SC201',NULL,'apartment',2,'1BR',820.00,0,'OCCUPIED',55000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(19,9,1,'SC202',NULL,'apartment',2,'studio',480.00,0,'AVAILABLE',38000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(20,10,1,'1402','9988776655','Residential',14,'2BR Luxury Apartment',125.50,1,'OCCUPIED',95000.00,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(21,1,1,'999-TEMP',NULL,'Residential',9,'1BR',NULL,0,'AVAILABLE',50000.00,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(22,11,1,'1402','9988776655','Residential',14,'2BR Luxury Apartment',125.50,1,'OCCUPIED',95000.00,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(23,1,1,'999-TEMP',NULL,'Residential',9,'1BR',NULL,0,'AVAILABLE',50000.00,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(24,12,1,'1402','9988776655','Residential',14,'2BR Luxury Apartment',125.50,1,'OCCUPIED',95000.00,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(25,1,1,'999-TEMP',NULL,'Residential',9,'1BR',NULL,0,'AVAILABLE',50000.00,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(26,15,4,'1',NULL,NULL,2,'apartment',5.00,0,'BOOKED',30000.00,'2026-08-25 08:06:22','2026-09-03 05:26:29'),
(27,16,7,'BK-5401','DEWA-77441','Royal Suite',54,'apartment',2800.00,1,'AVAILABLE',320000.00,'2026-09-01 04:51:47','2026-09-01 04:51:47'),
(28,17,7,'VILLA-702','DEWA-88991','Signature Villa',2,'villa',4500.00,1,'OCCUPIED',450000.00,'2026-09-01 04:59:40','2026-09-01 04:59:41'),
(29,19,1,'E2E-2800',NULL,NULL,12,'apartment',1350.50,0,'BOOKED',115000.00,'2026-09-03 05:28:00','2026-09-03 05:28:00'),
(30,20,1,'E2E-3717',NULL,NULL,12,'apartment',1350.50,0,'BOOKED',115000.00,'2026-09-03 05:37:18','2026-09-03 05:37:18'),
(31,22,1,'MBH-163',NULL,NULL,1,'apartment',1250.00,0,'OCCUPIED',130000.00,'2026-09-06 11:52:16','2026-09-06 11:52:17'),
(32,22,1,'MBH-284',NULL,NULL,2,'penthouse',2200.00,0,'AVAILABLE',220000.00,'2026-09-06 11:52:16','2026-09-06 11:52:16'),
(33,23,5,'1204',NULL,NULL,12,'apartment',1350.00,0,'OCCUPIED',40000.00,'2026-09-06 12:22:13','2026-09-06 12:25:15'),
(34,24,9,'10009',NULL,NULL,1,'apartment',1200.00,0,'OCCUPIED',60000.00,'2026-09-11 13:23:07','2026-09-11 13:25:47'),
(35,25,9,'E2E-060721',NULL,NULL,14,'2BR',1250.00,1,'OCCUPIED',90000.00,'2026-09-18 01:07:21','2026-09-18 01:07:22'),
(36,25,9,'SETTLE-060721',NULL,NULL,1,'1BR',800.00,0,'AVAILABLE',40000.00,'2026-09-18 01:07:32','2026-09-18 01:07:32'),
(37,26,9,'E2E-060931',NULL,NULL,14,'2BR',1250.00,1,'OCCUPIED',90000.00,'2026-09-18 01:09:31','2026-09-18 01:09:32'),
(38,26,9,'SETTLE-060931',NULL,NULL,1,'1BR',800.00,0,'AVAILABLE',40000.00,'2026-09-18 01:09:34','2026-09-18 01:09:34'),
(39,27,9,'E2E-061142',NULL,NULL,14,'2BR',1250.00,1,'OCCUPIED',90000.00,'2026-09-18 01:11:42','2026-09-18 01:11:43'),
(40,27,9,'SETTLE-061142',NULL,NULL,1,'1BR',800.00,0,'AVAILABLE',40000.00,'2026-09-18 01:11:44','2026-09-18 01:11:44'),
(41,28,1,'E2E-061357',NULL,NULL,14,'2BR',1250.00,1,'OCCUPIED',90000.00,'2026-09-18 01:13:57','2026-09-18 01:13:58'),
(42,28,1,'SETTLE-061357',NULL,NULL,1,'1BR',800.00,0,'AVAILABLE',40000.00,'2026-09-18 01:14:00','2026-09-18 01:14:00');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','maintenance','owner','tenant','cashier','accountant') NOT NULL DEFAULT 'tenant',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `account_status` varchar(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Admin User','admin@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','admin',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(2,'Maintenance User','maintenance@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','maintenance',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(3,'Owner One','owner1@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(4,'Owner Two','owner2@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(5,'Tenant One','tenant1@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(6,'Tenant Two','tenant2@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(7,'Tenant Three','tenant3@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(8,'Owner User','owner@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(9,'Tenant User','tenant@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43','active'),
(10,'Mohammed Al Rashidi','m.rashidi@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 03:13:32','2026-08-21 23:45:43','active'),
(11,'Khalid Ibrahim Saeed','k.saeed@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 07:54:12','2026-08-21 23:45:43','active'),
(12,'Priya Nair Menon','p.menon@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 07:54:13','2026-08-21 23:45:43','active'),
(13,'David James Carter','d.carter@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 07:54:15','2026-08-21 23:45:43','active'),
(14,'Ahmed Hassan Al Farsi','a.farsi@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:16','2026-08-21 23:45:43','active'),
(15,'Samira Binte Malik','s.malik@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:17','2026-08-21 23:45:43','active'),
(16,'Raj Kumar Patel','r.patel@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:19','2026-08-21 23:45:43','active'),
(17,'Elena Vasquez Torres','e.torres@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:20','2026-08-21 23:45:43','active'),
(18,'James Kwame Osei','j.osei@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:21','2026-08-21 23:45:43','active'),
(19,'Sheikh Rashid Al Maktoum','rashid.sheikh@dubai.gov.ae',NULL,'$2y$12$6OYxrdqAN7FblUPrmd0/vugoPloiWlHc02OBD/wakAMSxRtxe9rUK','tenant',NULL,'2026-09-01 04:59:41','2026-09-11 11:56:01','active'),
(20,'Fiza Nazz','Owner10@gofreehold.com',NULL,'$2y$12$OOkvmcgQ1p2/rq5JPjveEe3irU.Z/0DsGMocUFMzZu2sMaH5wqEju','owner',NULL,'2026-09-11 13:20:36','2026-09-11 13:20:36','active'),
(21,'Umar','cashier1@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','cashier',NULL,'2026-09-16 02:03:54','2026-09-16 02:49:14','active'),
(22,'Sara','accountant1@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','accountant',NULL,'2026-09-16 07:12:27','2026-09-16 02:51:37','active'),
(23,'Ali Tech','maintenance2@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','maintenance',NULL,'2026-09-16 08:53:39','2026-09-16 08:53:39','active'),
(24,'Ali','Ali12@gmail.com',NULL,'$2y$12$eVc9Wx6vVivLX0GGBeogmeZGPJSeIw5k89dx7szHpnM0P6wv6c0zq','cashier',NULL,'2026-09-16 08:32:03','2026-09-16 08:32:03','pending'),
(25,'Fiza','Fizanaazz321@gmail.com',NULL,'$2y$12$Tevsp6gy/PS/pigmHMMWtuZ4GsYW71s.OQOisugSMiHgLMz2rgeAO','accountant',NULL,'2026-09-16 11:06:37','2026-09-16 11:07:11','active'),
(28,'abu bakar','abub96891@gmail.com',NULL,'$2y$12$HtXKlRhVbtSbqpRo/u21NO7VyFUaLzbP9.SBJ9rMn3uIhvuTjYNAi','owner',NULL,'2026-09-18 05:46:03','2026-09-18 05:46:03','active'),
(29,'Ayesha','ayesha908@gmail.com',NULL,'$2y$12$DoTItaXtQ3xVMI6xAJevq.AQyPUr13MiADSnI/JwqtXbJE7J2bLva','owner',NULL,'2026-09-18 06:06:20','2026-09-18 06:06:20','active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-18 17:14:35
